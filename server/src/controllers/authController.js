const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { createSendTokens, verifyRefreshToken, signAccessToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists (explicit check for a cleaner message)
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const user = await User.create({ name, email, password });
  logger.info(`New user registered: ${user.email}`);

  createSendTokens(user, 201, res);
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Select password explicitly since it is excluded by default
  const user = await User.findOne({ email }).select('+password');

  // Generic message prevents user enumeration attacks
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);
  createSendTokens(user, 200, res);
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token not provided.', 401));
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    return next(new AppError('User not found or account deactivated.', 401));
  }

  const newAccessToken = signAccessToken(user._id);

  res.status(200).json({
    status: 'success',
    accessToken: newAccessToken,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = (req, res) => {
  res.cookie('refreshToken', 'logged_out', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 1000, // expires in 10 seconds
  });

  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password (req.user from protect middleware has no password)
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from the current password.', 400));
  }

  user.password = newPassword;
  await user.save(); // pre-save hook handles hashing

  logger.info(`Password changed for user: ${user.email}`);
  createSendTokens(user, 200, res);
});

module.exports = { signup, login, refreshToken, logout, changePassword };
