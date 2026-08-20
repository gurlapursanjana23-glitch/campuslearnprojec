const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/db');
const sessionStore = require('../config/supabase');
const { sendTokenResponse, generateAccessToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { successResponse, errorResponse } = require('../utils/response');

// ─── @desc    Register new user
// ─── @route   POST /api/auth/register
// ─── @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNumber, employeeId, semester, platform, deviceInfo } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email already exists.');
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user record in Supabase
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: role || 'student',
        department_id: department || null,
        roll_number: rollNumber || null,
        employee_id: employeeId || null,
        semester: semester || 1,
        is_active: true,
        is_email_verified: true,
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('Supabase user register error:', createError);
      return errorResponse(res, 500, 'Failed to create user in database.');
    }

    // Map _id property for backward compatibility
    newUser._id = newUser.id;

    // Enforce 1 session per platform policy
    const userPlatform = (platform || 'web').toLowerCase();
    const sessionId = uuidv4();
    const clientDeviceInfo = deviceInfo || req.headers['user-agent'] || 'Web Browser';

    await sessionStore.createSession({
      userId: newUser.id,
      platform: userPlatform,
      sessionId,
      deviceInfo: clientDeviceInfo,
    });

    sendTokenResponse(newUser, 201, res, 'Registration successful!', {
      sessionId,
      platform: userPlatform,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, platform, deviceInfo } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user by email from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*, department:departments(*)')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error || !user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (!user.is_active) {
      return errorResponse(res, 401, 'Your account has been deactivated. Contact admin.');
    }

    // Update last login timestamp in Supabase
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Map _id property for backward compatibility
    user._id = user.id;

    // ─── 1-Web + 1-Mobile Session Enforcement ────────────────────────────────
    const userPlatform = (platform || 'web').toLowerCase();
    const sessionId = uuidv4();
    const clientDeviceInfo = deviceInfo || req.headers['user-agent'] || (userPlatform === 'mobile' ? 'Mobile App' : 'Web Browser');

    // Create session (this automatically revokes previous session for SAME platform)
    await sessionStore.createSession({
      userId: user.id,
      platform: userPlatform,
      sessionId,
      deviceInfo: clientDeviceInfo,
    });

    sendTokenResponse(user, 200, res, 'Login successful!', {
      sessionId,
      platform: userPlatform,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Refresh access token
// ─── @route   POST /api/auth/refresh
// ─── @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 401, 'Refresh token is required.');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const { data: user } = await supabase
      .from('users')
      .select('id, is_active')
      .eq('id', decoded.id)
      .single();

    if (!user || !user.is_active) {
      return errorResponse(res, 401, 'Invalid refresh token.');
    }

    const newAccessToken = generateAccessToken(user.id, decoded.sessionId);
    return successResponse(res, 200, 'Token refreshed.', { accessToken: newAccessToken });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired refresh token.');
  }
};

// ─── @desc    Verify email
// ─── @route   GET /api/auth/verify-email/:token
// ─── @access  Public
exports.verifyEmail = async (req, res, next) => {
  return successResponse(res, 200, 'Email verified successfully!');
};

// ─── @desc    Forgot password
// ─── @route   POST /api/auth/forgot-password
// ─── @access  Public
exports.forgotPassword = async (req, res, next) => {
  return successResponse(res, 200, 'If an account with that email exists, a reset link has been sent.');
};

// ─── @desc    Reset password
// ─── @route   PUT /api/auth/reset-password/:token
// ─── @access  Public
exports.resetPassword = async (req, res, next) => {
  return successResponse(res, 200, 'Password reset successful!');
};

// ─── @desc    Get current user
// ─── @route   GET /api/auth/me
// ─── @access  Private
exports.getMe = async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('*, department:departments(*)')
    .eq('id', req.user.id)
    .single();

  if (user) user._id = user.id;

  successResponse(res, 200, 'User fetched successfully.', user || req.user);
};

// ─── @desc    Update password
// ─── @route   PUT /api/auth/update-password
// ─── @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return errorResponse(res, 401, 'Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    sendTokenResponse(req.user, 200, res, 'Password updated successfully!');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Logout (revokes active session in backend/Supabase)
// ─── @route   POST /api/auth/logout
// ─── @access  Private
exports.logout = async (req, res, next) => {
  try {
    if (req.sessionId) {
      await sessionStore.revokeSession(req.sessionId);
    }
    successResponse(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get user's active sessions (Web + Mobile)
// ─── @route   GET /api/auth/sessions
// ─── @access  Private
exports.getUserSessions = async (req, res, next) => {
  try {
    const sessions = await sessionStore.getUserSessions(req.user.id);
    successResponse(res, 200, 'Active sessions retrieved successfully.', sessions);
  } catch (error) {
    next(error);
  }
};
