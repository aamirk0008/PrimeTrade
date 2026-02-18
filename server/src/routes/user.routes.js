const express = require('express');
const router = express.Router();

const {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  getUserById,
} = require('../controllers/userController');

const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const { updateProfileValidator } = require('../validators');

// All user routes require authentication
router.use(protect);

// ─── Current User Profile ─────────────────────────────────────────────────────
router
  .route('/me')
  .get(getMe)
  .patch(updateProfileValidator, validate, updateMe)
  .delete(deleteMe);

// ─── Admin: Manage All Users ──────────────────────────────────────────────────
router.use(restrictTo('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
