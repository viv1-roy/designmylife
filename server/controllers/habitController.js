const Habit = require('../models/Habit');

// @desc    Get all habits for user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id })
      .populate('goalId')
      .sort({ createdAt: -1 });
    
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id).populate('goalId');

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check ownership
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res) => {
  try {
    const { name, description, frequency, goalId } = req.body;

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      frequency,
      goalId
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check ownership
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check ownership
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await habit.deleteOne();
    res.json({ message: 'Habit removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark habit as complete for a date
// @route   POST /api/habits/:id/complete
// @access  Private
const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check ownership
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { date } = req.body;
    const completionDate = date ? new Date(date) : new Date();
    completionDate.setHours(0, 0, 0, 0);

    // Check if already completed for this date
    const existingCompletion = habit.completionHistory.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === completionDate.getTime();
    });

    if (!existingCompletion) {
      habit.completionHistory.push({
        date: completionDate,
        completed: true
      });

      // Update streak
      habit.updateStreak();
      await habit.save();
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get habit statistics
// @route   GET /api/habits/:id/stats
// @access  Private
const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check ownership
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const totalCompletions = habit.completionHistory.filter(h => h.completed).length;
    const last7Days = habit.completionHistory.filter(entry => {
      const daysDiff = (Date.now() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7 && entry.completed;
    }).length;

    const last30Days = habit.completionHistory.filter(entry => {
      const daysDiff = (Date.now() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30 && entry.completed;
    }).length;

    const stats = {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions,
      completionRate7Days: (last7Days / 7) * 100,
      completionRate30Days: (last30Days / 30) * 100,
      completionHistory: habit.completionHistory.slice(-30) // Last 30 entries
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  getHabitStats
};
