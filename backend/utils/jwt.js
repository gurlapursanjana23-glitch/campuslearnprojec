const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived) with sessionId & platform payload
 */
const generateAccessToken = (userId, sessionId = null, platform = 'web') => {
  return jwt.sign({ id: userId, sessionId, platform }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (userId, sessionId = null) => {
  return jwt.sign({ id: userId, sessionId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Send tokens in response (both access + refresh)
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success', sessionData = {}) => {
  const { sessionId = null, platform = 'web' } = sessionData;
  const accessToken = generateAccessToken(user._id, sessionId, platform);
  const refreshToken = generateRefreshToken(user._id, sessionId);

  // Sanitize user object
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    department: user.department,
    rollNumber: user.rollNumber,
    employeeId: user.employeeId,
    semester: user.semester,
    streak: user.streak,
    points: user.points,
    badges: user.badges,
    preferences: user.preferences,
  };

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userData,
      accessToken,
      refreshToken,
      sessionId,
      platform,
    },
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse };

