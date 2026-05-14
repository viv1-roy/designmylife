const aiClient = require('../aiClient');
const { validateBehavioralAnalysis } = require('../validators/jsonValidator');

/**
 * Behavioral Analyzer Module
 * Analyzes habit completion patterns and behavioral metrics
 */

class BehaviorAnalyzer {
  /**
   * Analyze user's behavioral patterns
   * @param {Object} data - Behavioral data
   * @param {Array} data.habits - Habit completion history
   * @param {Object} data.metrics - Behavioral metrics (BCI, consistency, etc.)
   * @returns {Promise<Object>} Behavioral insights
   */
  async analyzeBehavior(data) {
    try {
      // Validate inputs
      if (!data || !data.habits) {
        throw new Error('Habit data is required');
      }

      // Build structured prompt
      const prompt = this._buildPrompt(data);

      // Call AI client
      const response = await aiClient.makeRequest(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt: 'You are a behavioral psychology expert. Return only valid JSON with structured insights and patterns.'
      });

      // Validate response
      const validation = validateBehavioralAnalysis(response);
      if (!validation.valid) {
        console.error('Behavioral analysis validation errors:', validation.errors);
        return this._getFallbackAnalysis(data);
      }

      return response;

    } catch (error) {
      console.error('Behavioral analysis error:', error.message);
      return this._getFallbackAnalysis(data);
    }
  }

  /**
   * Build AI prompt for behavioral analysis
   */
  _buildPrompt(data) {
    const { habits, metrics } = data;

    // Calculate completion rates
    const habitStats = this._calculateHabitStats(habits);

    return `Analyze the following behavioral data and provide structured insights.

Habit Performance Data:
${habitStats.map((stat, idx) => `
Habit ${idx + 1}: ${stat.name}
- Frequency: ${stat.frequency}
- Current Streak: ${stat.currentStreak} days
- Longest Streak: ${stat.longestStreak} days
- Last 7 Days: ${stat.last7Days} completions
- Last 30 Days: ${stat.last30Days} completions
- Completion Rate: ${stat.completionRate}%
`).join('\n')}

Overall Metrics:
- Active Habits: ${habits.length}
- Average Streak: ${habitStats.reduce((sum, s) => sum + s.currentStreak, 0) / Math.max(habits.length, 1)} days
${metrics ? `- Behavioral Consistency Index: ${metrics.bci || 'N/A'}` : ''}

Analyze and return ONLY valid JSON in this exact format:
{
  "consistencyScore": 75,
  "patterns": [
    {
      "type": "strength|weakness|neutral",
      "description": "Clear description of pattern",
      "affectedHabits": ["Habit name 1", "Habit name 2"]
    }
  ],
  "insights": [
    {
      "type": "positive|warning|concern",
      "message": "Specific insight message",
      "impact": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "Specific actionable recommendation",
      "expectedImpact": "What this will improve"
    }
  ],
  "trendAnalysis": {
    "direction": "improving|stable|declining",
    "confidence": 0.85,
    "keyFactors": ["Factor 1", "Factor 2"]
  }
}

IMPORTANT:
- Be specific and actionable
- Base insights on actual data
- Consistency score 0-100
- No fabricated information
- Return ONLY the JSON object`;
  }

  /**
   * Calculate habit statistics
   */
  _calculateHabitStats(habits) {
    return habits.map(habit => {
      const completionHistory = habit.completionHistory || [];
      const last7Days = this._getRecentCompletions(completionHistory, 7);
      const last30Days = this._getRecentCompletions(completionHistory, 30);

      return {
        name: habit.name,
        frequency: habit.frequency,
        currentStreak: habit.currentStreak || 0,
        longestStreak: habit.longestStreak || 0,
        last7Days,
        last30Days,
        completionRate: Math.round((last30Days / 30) * 100)
      };
    });
  }

  /**
   * Get recent completions count
   */
  _getRecentCompletions(history, days) {
    if (!Array.isArray(history)) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate && entry.completed;
    }).length;
  }

  /**
   * Fallback analysis when AI fails
   */
  _getFallbackAnalysis(data) {
    const habits = data.habits || [];
    const habitStats = this._calculateHabitStats(habits);

    const avgStreak = habitStats.reduce((sum, s) => sum + s.currentStreak, 0) / Math.max(habits.length, 1);
    const avgCompletionRate = habitStats.reduce((sum, s) => sum + s.completionRate, 0) / Math.max(habits.length, 1);

    // Determine consistency score
    let consistencyScore = Math.round((avgStreak * 10 + avgCompletionRate) / 2);
    consistencyScore = Math.min(100, Math.max(0, consistencyScore));

    // Determine trend
    let direction = 'stable';
    if (avgCompletionRate > 70) direction = 'improving';
    else if (avgCompletionRate < 40) direction = 'declining';

    return {
      consistencyScore,
      patterns: [
        {
          type: avgCompletionRate > 60 ? 'strength' : 'weakness',
          description: `Overall habit completion rate is ${Math.round(avgCompletionRate)}%`,
          affectedHabits: habits.map(h => h.name)
        }
      ],
      insights: [
        {
          type: consistencyScore > 70 ? 'positive' : consistencyScore > 40 ? 'warning' : 'concern',
          message: `Your consistency score is ${consistencyScore}/100. ${
            consistencyScore > 70 
              ? 'Great job maintaining your habits!' 
              : consistencyScore > 40 
                ? 'There\'s room for improvement in habit consistency.' 
                : 'Focus on building more consistent habits.'
          }`,
          impact: 'high'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          action: avgStreak < 7 
            ? 'Focus on building a 7-day streak for your most important habit' 
            : 'Continue your current habit patterns and consider adding one new supportive habit',
          expectedImpact: 'Improved consistency and momentum'
        }
      ],
      trendAnalysis: {
        direction,
        confidence: 0.7,
        keyFactors: [
          `Average streak: ${Math.round(avgStreak)} days`,
          `Completion rate: ${Math.round(avgCompletionRate)}%`,
          `Active habits: ${habits.length}`
        ]
      },
      fallback: true
    };
  }
}

module.exports = new BehaviorAnalyzer();
