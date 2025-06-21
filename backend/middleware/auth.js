const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorHandler');

// Middleware to protect routes - requires valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
});

// Middleware to check if user email is verified
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this feature.'
    });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user is admin (you can customize this logic)
  const isAdmin = req.user.role === 'admin' || 
                  req.user.email === 'admin@finance.com' ||
                  req.user.isAdmin === true;

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required. You do not have permission to perform this action.'
    });
  }
  
  next();
};

// Combined middleware for admin routes (auth + admin check)
const adminOnly = [protect, requireAdmin];

// Combined middleware for verified users (auth + email verification)
const verifiedUserOnly = [protect, requireEmailVerified];

// Optional auth middleware - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Update last login
  user.lastLogin = new Date();
  user.save({ validateBeforeSave: false });

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: user.getPublicProfile()
    });
};

module.exports = {
  protect,
  requireEmailVerified,
  requireAdmin,
  adminOnly,
  verifiedUserOnly,
  optionalAuth,
  generateToken,
  sendTokenResponse
}; 