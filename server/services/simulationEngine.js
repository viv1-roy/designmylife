/**
 * Life Simulation Engine
 * Predicts progress based on habits, goals, and available time
 */

class SimulationEngine {
  /**
   * Simulate goal progress over a time period
   */
  static simulateGoalProgress(goal, habits, tasks, timeframe) {
    const simulation = {
      goalId: goal._id,
      goalTitle: goal.title,
      timeframe: timeframe, // in days
      projections: []
    };

    // Calculate daily progress rate based on linked habits and tasks
    const linkedHabits = habits.filter(h => h.goalId && h.goalId.toString() === goal._id.toString());
    const linkedTasks = tasks.filter(t => t.goalId && t.goalId.toString() === goal._id.toString());

    // Habit contribution (consistency factor)
    const habitScore = this.calculateHabitScore(linkedHabits);
    
    // Task completion rate
    const taskScore = this.calculateTaskScore(linkedTasks);
    
    // Combined daily progress rate (0-100%)
    const dailyProgressRate = (habitScore * 0.6 + taskScore * 0.4) / timeframe;

    // Project progress for each day
    let currentProgress = goal.progress || 0;
    for (let day = 1; day <= timeframe; day++) {
      currentProgress = Math.min(100, currentProgress + dailyProgressRate);
      
      simulation.projections.push({
        day: day,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
        projectedProgress: Math.round(currentProgress * 100) / 100,
        confidence: this.calculateConfidence(habitScore, taskScore, day)
      });
    }

    simulation.estimatedCompletion = this.estimateCompletion(currentProgress, dailyProgressRate);
    simulation.recommendedActions = this.generateRecommendations(habitScore, taskScore, linkedHabits, linkedTasks);

    return simulation;
  }

  /**
   * Calculate habit consistency score
   */
  static calculateHabitScore(habits) {
    if (habits.length === 0) return 0;

    const totalScore = habits.reduce((sum, habit) => {
      const streakScore = Math.min(habit.currentStreak / 30, 1) * 100; // Max 30-day streak
      const completionRate = this.getHabitCompletionRate(habit);
      return sum + (streakScore * 0.4 + completionRate * 0.6);
    }, 0);

    return totalScore / habits.length;
  }

  /**
   * Get habit completion rate from history
   */
  static getHabitCompletionRate(habit) {
    if (!habit.completionHistory || habit.completionHistory.length === 0) return 0;

    const last30Days = habit.completionHistory.filter(entry => {
      const daysDiff = (Date.now() - new Date(entry.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    if (last30Days.length === 0) return 0;

    const completed = last30Days.filter(entry => entry.completed).length;
    return (completed / Math.min(30, last30Days.length)) * 100;
  }

  /**
   * Calculate task completion score
   */
  static calculateTaskScore(tasks) {
    if (tasks.length === 0) return 50; // Default score if no tasks

    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    
    return ((completed * 100) + (inProgress * 50)) / tasks.length;
  }

  /**
   * Calculate confidence level for projection
   */
  static calculateConfidence(habitScore, taskScore, daysAhead) {
    // Confidence decreases as we project further into the future
    const baseConfidence = (habitScore + taskScore) / 2;
    const timeDecay = Math.max(0, 100 - (daysAhead * 0.5));
    return Math.min(100, (baseConfidence + timeDecay) / 2);
  }

  /**
   * Estimate days to completion
   */
  static estimateCompletion(currentProgress, dailyRate) {
    if (dailyRate === 0) return null;
    const remainingProgress = 100 - currentProgress;
    const daysToComplete = Math.ceil(remainingProgress / dailyRate);
    return {
      days: daysToComplete,
      estimatedDate: new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Generate actionable recommendations
   */
  static generateRecommendations(habitScore, taskScore, habits, tasks) {
    const recommendations = [];

    if (habitScore < 50) {
      recommendations.push({
        type: 'habit',
        priority: 'high',
        message: 'Improve habit consistency to accelerate progress',
        action: 'Focus on maintaining daily streaks'
      });
    }

    if (taskScore < 50) {
      recommendations.push({
        type: 'task',
        priority: 'high',
        message: 'Complete pending tasks to stay on track',
        action: `You have ${tasks.filter(t => t.status === 'todo').length} pending tasks`
      });
    }

    if (habits.length === 0) {
      recommendations.push({
        type: 'habit',
        priority: 'medium',
        message: 'Create supporting habits for this goal',
        action: 'Link daily habits to reinforce progress'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        priority: 'low',
        message: 'Great job! You\'re on track',
        action: 'Keep up the momentum'
      });
    }

    return recommendations;
  }

  /**
   * Analyze overall life system health
   */
  static analyzeLifeSystem(goals, habits, tasks) {
    const analysis = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'in-progress').length,
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      systemHealth: 0,
      insights: []
    };

    // Calculate system health score
    const goalProgress = goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(goals.length, 1);
    const habitStrength = habits.reduce((sum, h) => sum + h.currentStreak, 0) / Math.max(habits.length, 1) * 10;
    const taskCompletion = (analysis.completedTasks / Math.max(analysis.totalTasks, 1)) * 100;

    analysis.systemHealth = Math.round((goalProgress + Math.min(habitStrength, 100) + taskCompletion) / 3);

    // Generate insights
    if (analysis.systemHealth < 40) {
      analysis.insights.push('Your life system needs attention. Focus on building consistent habits.');
    } else if (analysis.systemHealth < 70) {
      analysis.insights.push('You\'re making progress. Keep building momentum.');
    } else {
      analysis.insights.push('Excellent! Your life system is thriving.');
    }

    return analysis;
  }
}

module.exports = SimulationEngine;
