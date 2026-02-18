const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  refreshToken,
  logout,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/errorHandler');
const {
  signupValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators');

// Public routes — rate limited to prevent brute force
router.post('/signup', authLimiter, signupValidator, validate, signup);
router.post('/login',  authLimiter, loginValidator,  validate, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.patch('/change-password', protect, changePasswordValidator, validate, changePassword);

module.exports = router;
