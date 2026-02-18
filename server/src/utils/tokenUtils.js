const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

/**
 * Sign an access token for the given user ID.
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} Signed JWT
 */
const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Sign a refresh token for the given user ID.
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} Signed JWT
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

/**
 * Verify an access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {AppError} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      throw new AppError('Your session has expired. Please log in again.', 401);
    throw new AppError('Invalid token. Please log in again.', 401);
  }
};

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {AppError} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }
};

/**
 * Build and send the auth token response.
 * Sets a secure HttpOnly cookie for the refresh token and returns the access token.
 */
const createSendTokens = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ← changed this
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createSendTokens,
};
