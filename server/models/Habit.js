const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a habit name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completionHistory: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate streak on completion
habitSchema.methods.updateStreak = function() {
  if (this.completionHistory.length === 0) {
    this.currentStreak = 0;
    return;
  }

  // Sort by date descending
  const sorted = this.completionHistory.sort((a, b) => b.date - a.date);
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const completionDate = new Date(sorted[i].date);
    completionDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (completionDate.getTime() === expectedDate.getTime() && sorted[i].completed) {
      streak++;
    } else {
      break;
    }
  }

  this.currentStreak = streak;
  if (streak > this.longestStreak) {
    this.longestStreak = streak;
  }
};

module.exports = mongoose.model('Habit', habitSchema);
