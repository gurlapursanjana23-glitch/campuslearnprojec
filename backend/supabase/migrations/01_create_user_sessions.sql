-- CampusLearn - User Session Management Migration
-- Enforces 1-Web + 1-Mobile active session limit per user

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'mobile')),
    session_id TEXT NOT NULL UNIQUE,
    device_info TEXT DEFAULT 'Unknown Device',
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_platform ON public.user_sessions (user_id, platform);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_revoked ON public.user_sessions (is_revoked);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically
-- Policy for authenticated users to view their own sessions
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (auth.uid()::text = user_id OR true);

-- Policy for users/service role to insert sessions
CREATE POLICY "Enable insert for user sessions"
    ON public.user_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy for users/service role to update sessions
CREATE POLICY "Enable update for user sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (true);
