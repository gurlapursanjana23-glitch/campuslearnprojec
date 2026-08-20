const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
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

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email already exists.');
    }

    // Create user
    const user = await User.create({
      name, email, password, role: role || 'student',
      department, rollNumber, employeeId, semester,
    });

    // Enforce 1 session per platform policy
    const userPlatform = (platform || 'web').toLowerCase();
    const sessionId = uuidv4();
    const clientDeviceInfo = deviceInfo || req.headers['user-agent'] || 'Web Browser';

    await sessionStore.createSession({
      userId: user._id,
      platform: userPlatform,
      sessionId,
      deviceInfo: clientDeviceInfo,
    });

    // Send verification email
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(user, verificationUrl);
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
    }

    sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.', {
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

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return errorResponse(res, 401, 'Your account has been deactivated. Contact admin.');
    }

    // Update last login + streak
    user.lastLogin = new Date();
    user.updateStreak();
    await user.save({ validateBeforeSave: false });

    // ─── 1-Web + 1-Mobile Session Enforcement ────────────────────────────────
    const userPlatform = (platform || 'web').toLowerCase();
    const sessionId = uuidv4();
    const clientDeviceInfo = deviceInfo || req.headers['user-agent'] || (userPlatform === 'mobile' ? 'Mobile App' : 'Web Browser');

    // Create session (this automatically revokes previous session for SAME platform)
    await sessionStore.createSession({
      userId: user._id,
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
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'Invalid refresh token.');
    }

    const newAccessToken = generateAccessToken(user._id);
    return successResponse(res, 200, 'Token refreshed.', { accessToken: newAccessToken });
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired refresh token.');
  }
};

// ─── @desc    Verify email
// ─── @route   GET /api/auth/verify-email/:token
// ─── @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    try { await sendWelcomeEmail(user); } catch (_) {}

    return successResponse(res, 200, 'Email verified successfully! You can now log in.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Forgot password
// ─── @route   POST /api/auth/forgot-password
// ─── @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Security: don't reveal if email exists
      return successResponse(res, 200, 'If an account with that email exists, a reset link has been sent.');
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 500, 'Failed to send reset email. Please try again.');
    }

    return successResponse(res, 200, 'Password reset link sent to your email.');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Reset password
// ─── @route   PUT /api/auth/reset-password/:token
// ─── @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpire');

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token.');
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful!');
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get current user
// ─── @route   GET /api/auth/me
// ─── @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  successResponse(res, 200, 'User fetched successfully.', user);
};

// ─── @desc    Update password
// ─── @route   PUT /api/auth/update-password
// ─── @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return errorResponse(res, 401, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully!');
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
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
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
    const sessions = await sessionStore.getUserSessions(req.user._id);
    successResponse(res, 200, 'Active sessions retrieved successfully.', sessions);
  } catch (error) {
    next(error);
  }
};

