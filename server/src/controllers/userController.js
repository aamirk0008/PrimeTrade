const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── GET /api/users/me ────────────────────────────────────────────────────────
const getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the protect middleware
  // Re-fetch to get latest data and virtual fields
  const user = await User.findById(req.user._id);

  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// ─── PATCH /api/users/me ──────────────────────────────────────────────────────
const updateMe = catchAsync(async (req, res, next) => {
  // Whitelist allowed fields to prevent mass-assignment attacks
  const ALLOWED_FIELDS = ['name', 'bio', 'avatar'];
  const filteredBody = {};

  ALLOWED_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  });

  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError('No valid fields provided for update.', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,       // Return the updated document
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

// ─── DELETE /api/users/me ─────────────────────────────────────────────────────
const deleteMe = catchAsync(async (req, res, next) => {
  // Soft delete — mark as inactive rather than hard delete
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/users  (admin only)
const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, isActive } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: { users },
  });
});

// GET /api/users/:id  (admin only)
const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('No user found with that ID.', 404));

  res.status(200).json({ status: 'success', data: { user } });
});

module.exports = { getMe, updateMe, deleteMe, getAllUsers, getUserById };
