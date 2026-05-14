const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTodayTasks,
  getUpcomingTasks,
  getOverdueTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.get('/today', protect, getTodayTasks);
router.get('/upcoming', protect, getUpcomingTasks);
router.get('/overdue', protect, getOverdueTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
