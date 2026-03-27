const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
        message: 'Please login to continue'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token is no longer valid',
          message: 'User not found. Please login again'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated. Please contact support'
        });
      }

      // Attach user to request
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Please login again'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication',
      message: error.message
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        message: 'Please login first'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `User role ${req.user.userType} is not authorized to access this route`
      });
    }

    next();
  };
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required',
      message: 'Please verify your email address to continue'
    });
  }

  next();
};

// Middleware to check if driver is approved (for driver-specific routes)
const requireDriverApproval = (req, res, next) => {
  if (req.user.userType === 'driver' && !req.user.driverDetails?.isApproved) {
    return res.status(403).json({
      success: false,
      error: 'Driver approval required',
      message: 'Your driver account is pending approval. Please contact support'
    });
  }

  next();
};

// Middleware to check subscription status for premium features
const requireSubscription = (req, res, next) => {
  if (!req.user.subscription?.isActive) {
    return res.status(403).json({
      success: false,
      error: 'Subscription required',
      message: 'This feature requires an active subscription'
    });
  }

  // Check if subscription is expired
  if (req.user.subscription.endDate && new Date(req.user.subscription.endDate) < new Date()) {
    return res.status(403).json({
      success: false,
      error: 'Subscription expired',
      message: 'Your subscription has expired. Please renew to continue'
    });
  }

  next();
};

// Middleware to check if user owns a resource
const checkOwnership = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[idParam]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
          message: 'The requested resource does not exist'
        });
      }

      // Check different ownership patterns
      let isOwner = false;
      
      if (resource.user && resource.user.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resource.driver && resource.driver.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resource.rider && resource.rider.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resource._id && resource._id.toString() === req.user._id.toString()) {
        isOwner = true;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      });
    }
  };
};

// Middleware to extract user from token without requiring it (for optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  authorize,
  requireVerification,
  requireDriverApproval,
  requireSubscription,
  checkOwnership,
  optionalAuth
};