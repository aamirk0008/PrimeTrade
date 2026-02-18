const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  getTaskStats,
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const {
  createTaskValidator,
  updateTaskValidator,
  taskQueryValidator,
} = require('../validators');

// All task routes require authentication
router.use(protect);

// ─── Stats (must be before /:id to avoid being matched as an ID) ──────────────
router.get('/stats', getTaskStats);

// ─── Bulk Operations ──────────────────────────────────────────────────────────
router.delete('/bulk', bulkDeleteTasks);

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router
  .route('/')
  .get(taskQueryValidator, validate, getAllTasks)
  .post(createTaskValidator, validate, createTask);

router
  .route('/:id')
  .get(getTask)
  .patch(updateTaskValidator, validate, updateTask)
  .delete(deleteTask);

module.exports = router;
