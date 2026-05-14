const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  linkHabitToGoal,
  linkTaskToGoal
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.post('/:id/link-habit', protect, linkHabitToGoal);
router.post('/:id/link-task', protect, linkTaskToGoal);

module.exports = router;
