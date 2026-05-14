const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Task = require('../models/Task');

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .populate('linkedHabits')
      .populate('linkedTasks')
      .sort({ createdAt: -1 });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('linkedHabits')
      .populate('linkedTasks');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, description, category, priority, targetDate } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      category,
      priority,
      targetDate
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Link habit to goal
// @route   POST /api/goals/:id/link-habit
// @access  Private
const linkHabitToGoal = async (req, res) => {
  try {
    const { habitId } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Add habit to goal's linked habits if not already linked
    if (!goal.linkedHabits.includes(habitId)) {
      goal.linkedHabits.push(habitId);
      habit.goalId = goal._id;
      await habit.save();
      await goal.save();
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Link task to goal
// @route   POST /api/goals/:id/link-task
// @access  Private
const linkTaskToGoal = async (req, res) => {
  try {
    const { taskId } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check ownership
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Add task to goal's linked tasks if not already linked
    if (!goal.linkedTasks.includes(taskId)) {
      goal.linkedTasks.push(taskId);
      task.goalId = goal._id;
      await task.save();
      await goal.save();
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  linkHabitToGoal,
  linkTaskToGoal
};
