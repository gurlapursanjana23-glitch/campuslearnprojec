const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'https://your-supabase-project.supabase.co') {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    console.log('✅ Supabase Client initialized successfully');
  } catch (err) {
    console.warn('⚠️  Supabase init error:', err.message);
  }
} else {
  console.log('ℹ️  Supabase URL/Key not configured. Using backend session manager.');
}

/**
 * Session Store Helper: Handles user_sessions in Supabase DB with local fallback store
 */
const localSessions = new Map();

const sessionStore = {
  getSupabaseClient: () => supabase,

  /**
   * Create or replace session for a specific platform ('web' or 'mobile')
   * Enforces 1-Web + 1-Mobile policy: Revokes existing active session for SAME platform
   */
  createSession: async ({ userId, platform, sessionId, deviceInfo }) => {
    const plat = (platform || 'web').toLowerCase();
    if (!['web', 'mobile'].includes(plat)) {
      throw new Error('Platform must be either "web" or "mobile".');
    }

    // 1. If Supabase client exists, update/revoke previous sessions on SAME platform in Supabase
    if (supabase) {
      try {
        await supabase
          .from('user_sessions')
          .update({ is_revoked: true, updated_at: new Date().toISOString() })
          .eq('user_id', String(userId))
          .eq('platform', plat)
          .eq('is_revoked', false);

        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: String(userId),
            platform: plat,
            session_id: sessionId,
            device_info: deviceInfo || 'Unknown Device',
            last_activity: new Date().toISOString(),
            is_revoked: false,
          })
          .select()
          .single();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase session insert warning:', err.message);
      }
    }

    // 2. In-memory / Mongo fallback tracking
    for (const [sId, sess] of localSessions.entries()) {
      if (sess.userId === String(userId) && sess.platform === plat) {
        sess.isRevoked = true;
      }
    }

    const newSession = {
      id: sessionId,
      userId: String(userId),
      platform: plat,
      sessionId,
      deviceInfo: deviceInfo || 'Unknown Device',
      lastActivity: new Date(),
      isRevoked: false,
      createdAt: new Date(),
    };

    localSessions.set(sessionId, newSession);
    return newSession;
  },

  /**
   * Validate if a session ID is active and not revoked
   */
  validateSession: async (sessionId, userId) => {
    if (!sessionId) return false;

    // Check Supabase first if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (!error && data) {
          if (data.is_revoked) return false;
          // Update last_activity asynchronously
          supabase
            .from('user_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('session_id', sessionId)
            .then(() => {});
          return true;
        }
      } catch (err) {
        // Fallback to local check
      }
    }

    // Local fallback check
    const localSess = localSessions.get(sessionId);
    if (!localSess) {
      // If session was generated before session store init or in stateless mode, accept valid JWT
      return true;
    }

    if (localSess.isRevoked) return false;
    localSess.lastActivity = new Date();
    return true;
  },

  /**
   * Revoke a specific session (e.g. on user logout)
   */
  revokeSession: async (sessionId) => {
    if (!sessionId) return;

    if (supabase) {
      try {
        await supabase
          .from('user_sessions')
          .update({ is_revoked: true, updated_at: new Date().toISOString() })
          .eq('session_id', sessionId);
      } catch (err) {}
    }

    const sess = localSessions.get(sessionId);
    if (sess) sess.isRevoked = true;
  },

  /**
   * List active sessions for user
   */
  getUserSessions: async (userId) => {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', String(userId))
          .eq('is_revoked', false);
        if (data) return data;
      } catch (err) {}
    }

    const userSessList = [];
    for (const sess of localSessions.values()) {
      if (sess.userId === String(userId) && !sess.isRevoked) {
        userSessList.push(sess);
      }
    }
    return userSessList;
  },
};

module.exports = sessionStore;
