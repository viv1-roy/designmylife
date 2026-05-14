const goalDecomposer = require('../ai/modules/goalDecomposer');
const behaviorAnalyzer = require('../ai/modules/behaviorAnalyzer');
const planningOptimizer = require('../ai/modules/planningOptimizer');
const reflectionAnalyzer = require('../ai/modules/reflectionAnalyzer');
const aiClient = require('../ai/aiClient');

/**
 * AI Controller
 * Handles all AI-powered endpoints
 */

// @desc    Decompose goal into structured plan
// @route   POST /api/ai/decompose-goal
// @access  Private
const decomposeGoal = async (req, res) => {
  try {
    // Check if AI is configured
    if (!aiClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'AI features are currently unavailable. Please configure AI_API_KEY.',
        fallback: true
      });
    }

    const { goalData, availableHoursPerWeek } = req.body;

    // Validate input
    if (!goalData || !goalData.title) {
      return res.status(400).json({ message: 'Goal data with title is required' });
    }

    // Call goal decomposer
    const result = await goalDecomposer.decomposeGoal(goalData, availableHoursPerWeek);

    res.json({
      success: true,
      data: result,
      fallback: result.fallback || false
    });

  } catch (error) {
    console.error('Goal decomposition error:', error);
    res.status(500).json({ 
      message: 'Failed to decompose goal',
      error: error.message 
    });
  }
};

// @desc    Analyze behavioral patterns
// @route   POST /api/ai/analyze-behavior
// @access  Private
const analyzeBehavior = async (req, res) => {
  try {
    // Check if AI is configured
    if (!aiClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'AI features are currently unavailable. Please configure AI_API_KEY.',
        fallback: true
      });
    }

    const { habits, metrics } = req.body;

    // Validate input
    if (!habits || !Array.isArray(habits)) {
      return res.status(400).json({ message: 'Habits array is required' });
    }

    // Call behavior analyzer
    const result = await behaviorAnalyzer.analyzeBehavior({ habits, metrics });

    res.json({
      success: true,
      data: result,
      fallback: result.fallback || false
    });

  } catch (error) {
    console.error('Behavior analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze behavior',
      error: error.message 
    });
  }
};

// @desc    Optimize planning workload
// @route   POST /api/ai/optimize-plan
// @access  Private
const optimizePlan = async (req, res) => {
  try {
    // Check if AI is configured
    if (!aiClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'AI features are currently unavailable. Please configure AI_API_KEY.',
        fallback: true
      });
    }

    const { tasks, availableHours, progress, consistencyScore } = req.body;

    // Validate input
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }

    // Call planning optimizer
    const result = await planningOptimizer.optimizePlan({
      tasks,
      availableHours,
      progress,
      consistencyScore
    });

    res.json({
      success: true,
      data: result,
      fallback: result.fallback || false
    });

  } catch (error) {
    console.error('Planning optimization error:', error);
    res.status(500).json({ 
      message: 'Failed to optimize plan',
      error: error.message 
    });
  }
};

// @desc    Analyze reflection text
// @route   POST /api/ai/analyze-reflection
// @access  Private
const analyzeReflection = async (req, res) => {
  try {
    // Check if AI is configured
    if (!aiClient.isConfigured()) {
      return res.status(503).json({ 
        message: 'AI features are currently unavailable. Please configure AI_API_KEY.',
        fallback: true
      });
    }

    const { reflectionText, context } = req.body;

    // Validate input
    if (!reflectionText || typeof reflectionText !== 'string') {
      return res.status(400).json({ message: 'Reflection text is required' });
    }

    if (reflectionText.trim().length === 0) {
      return res.status(400).json({ message: 'Reflection text cannot be empty' });
    }

    // Call reflection analyzer
    const result = await reflectionAnalyzer.analyzeReflection(reflectionText, context);

    res.json({
      success: true,
      data: result,
      fallback: result.fallback || false
    });

  } catch (error) {
    console.error('Reflection analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze reflection',
      error: error.message 
    });
  }
};

// @desc    Check AI service status
// @route   GET /api/ai/status
// @access  Private
const getAIStatus = async (req, res) => {
  try {
    const isConfigured = aiClient.isConfigured();

    res.json({
      available: isConfigured,
      provider: process.env.AI_PROVIDER || 'anthropic',
      features: {
        goalDecomposition: isConfigured,
        behaviorAnalysis: isConfigured,
        planningOptimization: isConfigured,
        reflectionAnalysis: isConfigured
      },
      message: isConfigured 
        ? 'AI features are available'
        : 'AI features are disabled. Set AI_API_KEY to enable.'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to check AI status',
      error: error.message 
    });
  }
};

module.exports = {
  decomposeGoal,
  analyzeBehavior,
  optimizePlan,
  analyzeReflection,
  getAIStatus
};
