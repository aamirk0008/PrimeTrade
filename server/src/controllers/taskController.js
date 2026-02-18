const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Helper: Build filter object from query params ─────────────────────────────
const buildFilter = (query, userId) => {
  const filter = { user: userId };

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  // Tag filter (comma-separated → array)
  if (query.tags) {
    filter.tags = { $in: query.tags.split(',').map((t) => t.trim()) };
  }

  // Due date range
  if (query.dueBefore || query.dueAfter) {
    filter.dueDate = {};
    if (query.dueBefore) filter.dueDate.$lte = new Date(query.dueBefore);
    if (query.dueAfter) filter.dueDate.$gte = new Date(query.dueAfter);
  }

  // Full-text search on title & description (requires text index on the model)
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

// ─── Helper: Build sort string from query params ───────────────────────────────
const buildSort = (query) => {
  const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
  const sortField = VALID_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const order = query.order === 'asc' ? '' : '-';
  return `${order}${sortField}`;
};

// ─── GET /api/tasks ────────────────────────────────────────────────────────────
const getAllTasks = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query, req.user._id);
  const sort = buildSort(req.query);

  // Run count and data queries in parallel for efficiency
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { tasks },
  });
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    return next(new AppError('No task found with that ID.', 404));
  }

  res.status(200).json({ status: 'success', data: { task } });
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = catchAsync(async (req, res) => {
  const { title, description, status, priority, tags, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    tags,
    dueDate,
    user: req.user._id,
  });

  res.status(201).json({ status: 'success', data: { task } });
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
const updateTask = catchAsync(async (req, res, next) => {
  const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'tags', 'dueDate'];
  const updates = {};

  ALLOWED_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No valid fields provided for update.', 400));
  }

  // findOneAndUpdate is efficient but doesn't trigger pre('save') hooks
  // For completeness, we use findOne + save to trigger the completedAt hook
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    return next(new AppError('No task found with that ID.', 404));
  }

  Object.assign(task, updates);
  await task.save();

  res.status(200).json({ status: 'success', data: { task } });
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!task) {
    return next(new AppError('No task found with that ID.', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});

// ─── DELETE /api/tasks (bulk delete by status) ────────────────────────────────
const bulkDeleteTasks = catchAsync(async (req, res, next) => {
  const { status } = req.query;

  if (!status) {
    return next(new AppError('Provide a status query param for bulk delete.', 400));
  }

  const result = await Task.deleteMany({ user: req.user._id, status });

  res.status(200).json({
    status: 'success',
    message: `Deleted ${result.deletedCount} task(s) with status "${status}".`,
  });
});

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
const getTaskStats = catchAsync(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  const overdue = await Task.countDocuments({
    user: req.user._id,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() },
  });

  res.status(200).json({
    status: 'success',
    data: { byStatus: stats, byPriority: priorityStats, overdue },
  });
});

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  getTaskStats,
};
