const Task = require('../models/Task');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, goalId } = req.query;
    
    let filter = { user: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (goalId) filter.goalId = goalId;

    const tasks = await Task.find(filter)
      .populate('goalId')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('goalId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, estimatedTime, goalId, tags } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate,
      estimatedTime,
      goalId,
      tags
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's tasks
// @route   GET /api/tasks/today
// @access  Private
const getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('goalId').sort({ priority: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming tasks
// @route   GET /api/tasks/upcoming
// @access  Private
const getUpcomingTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: today },
      status: { $ne: 'completed' }
    }).populate('goalId').sort({ dueDate: 1 }).limit(10);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $lt: today },
      status: { $ne: 'completed' }
    }).populate('goalId').sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTodayTasks,
  getUpcomingTasks,
  getOverdueTasks
};
