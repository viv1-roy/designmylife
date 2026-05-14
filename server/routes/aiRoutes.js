const express = require('express');
const router = express.Router();
const {
  decomposeGoal,
  analyzeBehavior,
  optimizePlan,
  analyzeReflection,
  getAIStatus
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// AI service status
router.get('/status', getAIStatus);

// Goal decomposition
router.post('/decompose-goal', decomposeGoal);

// Behavioral analysis
router.post('/analyze-behavior', analyzeBehavior);

// Planning optimization
router.post('/optimize-plan', optimizePlan);

// Reflection analysis
router.post('/analyze-reflection', analyzeReflection);

module.exports = router;
