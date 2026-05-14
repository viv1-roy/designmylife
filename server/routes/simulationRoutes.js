const express = require('express');
const router = express.Router();
const {
  simulateGoalProgress,
  analyzeSystemHealth,
  getProductivityInsights
} = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/goal/:id', protect, simulateGoalProgress);
router.get('/system-health', protect, analyzeSystemHealth);
router.get('/insights', protect, getProductivityInsights);

module.exports = router;
