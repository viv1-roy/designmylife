const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  getHabitStats
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHabits)
  .post(protect, createHabit);

router.route('/:id')
  .get(protect, getHabit)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

router.post('/:id/complete', protect, completeHabit);
router.get('/:id/stats', protect, getHabitStats);

module.exports = router;
