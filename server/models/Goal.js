const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['career', 'health', 'learning', 'finance', 'relationship', 'personal', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  linkedHabits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit'
  }],
  linkedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
