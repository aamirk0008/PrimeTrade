const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Protect routes — verifies JWT and attaches user to req.user.
 */
const protect = catchAsync(async (req, res, next) => {
  // 1. Extract token from Authorization header or cookie
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Verify token signature and expiry
  const decoded = verifyAccessToken(token);

  // 3. Check if user still exists in DB (handles deleted accounts)
  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Check if account is still active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // 5. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('You recently changed your password. Please log in again.', 401));
  }

  // Grant access — attach user to request
  req.user = currentUser;
  next();
});

/**
 * Restrict routes to specific roles (role-based access control).
 * Must be used AFTER protect middleware.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }
  next();
};

/**
 * Optional auth — attaches user if token is present, but does not fail if missing.
 * Useful for endpoints that behave differently for authenticated vs. anonymous users.
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user?.isActive) req.user = user;
  } catch {
    // Silently continue without user
  }

  next();
});

module.exports = { protect, restrictTo, optionalAuth };
