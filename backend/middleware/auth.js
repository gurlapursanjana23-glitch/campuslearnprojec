const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sessionStore = require('../config/supabase');

/**
 * Middleware: Verify JWT, validate session state in Supabase/backend, and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.', code: 'USER_NOT_FOUND' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.', code: 'ACCOUNT_DEACTIVATED' });
    }

    // Session Enforcement: Validate session ID if present in decoded token
    if (decoded.sessionId) {
      const isValidSession = await sessionStore.validateSession(decoded.sessionId, user._id);
      if (!isValidSession) {
        return res.status(401).json({
          success: false,
          code: 'SESSION_REVOKED',
          message: 'Your session has been logged out because a new login occurred on another device for this platform.',
        });
      }
    }

    req.user = user;
    req.sessionId = decoded.sessionId;
    req.platform = decoded.platform || 'web';
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.', code: 'INVALID_TOKEN' });
  }
};

/**
 * Middleware: Role-Based Access Control (RBAC)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

/**
 * Middleware: Optional auth (attaches user if token present, doesn't block if not)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    }
  } catch (_) {
    // Silent fail for optional auth
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
