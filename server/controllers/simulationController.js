const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const SimulationEngine = require('../services/simulationEngine');

// @desc    Simulate goal progress
// @route   POST /api/simulation/goal/:id
// @access  Private
const simulateGoalProgress = async (req, res) => {
  try {
    const { timeframe } = req.body; // in days
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get related habits and tasks
    const habits = await Habit.find({ 
      user: req.user._id,
      goalId: goal._id 
    });

    const tasks = await Task.find({ 
      user: req.user._id,
      goalId: goal._id 
    });

    // Run simulation
    const simulation = SimulationEngine.simulateGoalProgress(
      goal, 
      habits, 
      tasks, 
      timeframe || 30
    );

    res.json(simulation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze life system health
// @route   GET /api/simulation/system-health
// @access  Private
const analyzeSystemHealth = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    const habits = await Habit.find({ user: req.user._id });
    const tasks = await Task.find({ user: req.user._id });

    const analysis = SimulationEngine.analyzeLifeSystem(goals, habits, tasks);

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get productivity insights
// @route   GET /api/simulation/insights
// @access  Private
const getProductivityInsights = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    const habits = await Habit.find({ user: req.user._id });
    const tasks = await Task.find({ user: req.user._id });

    // Calculate various metrics
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const avgHabitStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0) / Math.max(habits.length, 1);
    const avgGoalProgress = goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(goals.length, 1);

    // Get tasks completed in last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCompletedTasks = completedTasks.filter(t => 
      t.completedAt && new Date(t.completedAt) >= last7Days
    );

    // Category breakdown
    const categoryBreakdown = {};
    goals.forEach(goal => {
      if (!categoryBreakdown[goal.category]) {
        categoryBreakdown[goal.category] = {
          count: 0,
          avgProgress: 0,
          totalProgress: 0
        };
      }
      categoryBreakdown[goal.category].count++;
      categoryBreakdown[goal.category].totalProgress += goal.progress;
    });

    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].avgProgress = 
        categoryBreakdown[category].totalProgress / categoryBreakdown[category].count;
    });

    const insights = {
      totalGoals: goals.length,
      totalHabits: habits.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      tasksCompletedLast7Days: recentCompletedTasks.length,
      avgHabitStreak: Math.round(avgHabitStreak * 10) / 10,
      avgGoalProgress: Math.round(avgGoalProgress * 10) / 10,
      categoryBreakdown,
      topPerformingCategory: Object.keys(categoryBreakdown).reduce((top, category) => {
        return categoryBreakdown[category].avgProgress > (categoryBreakdown[top]?.avgProgress || 0) 
          ? category 
          : top;
      }, null),
      recommendations: generateInsightRecommendations(goals, habits, tasks)
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate recommendations
const generateInsightRecommendations = (goals, habits, tasks) => {
  const recommendations = [];

  // Check for goals without habits
  const goalsWithoutHabits = goals.filter(g => !g.linkedHabits || g.linkedHabits.length === 0);
  if (goalsWithoutHabits.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${goalsWithoutHabits.length} goal(s) have no supporting habits`,
      action: 'Create daily habits to support your goals'
    });
  }

  // Check for inactive habits
  const inactiveHabits = habits.filter(h => !h.isActive);
  if (inactiveHabits.length > 0) {
    recommendations.push({
      type: 'info',
      message: `You have ${inactiveHabits.length} inactive habit(s)`,
      action: 'Consider reactivating or removing them'
    });
  }

  // Check for overdue tasks
  const overdueTasks = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );
  if (overdueTasks.length > 0) {
    recommendations.push({
      type: 'urgent',
      message: `${overdueTasks.length} task(s) are overdue`,
      action: 'Prioritize completing or rescheduling these tasks'
    });
  }

  // Check habit consistency
  const lowStreakHabits = habits.filter(h => h.isActive && h.currentStreak < 3);
  if (lowStreakHabits.length > 0) {
    recommendations.push({
      type: 'tip',
      message: 'Build consistency in your habits',
      action: 'Focus on maintaining streaks for better results'
    });
  }

  return recommendations;
};

module.exports = {
  simulateGoalProgress,
  analyzeSystemHealth,
  getProductivityInsights
};
