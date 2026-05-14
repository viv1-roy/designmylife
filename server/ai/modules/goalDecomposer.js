const aiClient = require('../aiClient');
const { validateGoalDecomposition, sanitizeTimeAllocation } = require('../validators/jsonValidator');

/**
 * Goal Decomposition Module
 * Converts goals into structured plans with milestones, habits, and tasks
 */

class GoalDecomposer {
  /**
   * Decompose a goal into actionable plan
   * @param {Object} goalData - Goal information
   * @param {string} goalData.title - Goal title
   * @param {string} goalData.description - Goal description
   * @param {string} goalData.category - Goal category
   * @param {Date} goalData.targetDate - Target completion date
   * @param {number} availableHoursPerWeek - Weekly time availability
   * @returns {Promise<Object>} Structured plan
   */
  async decomposeGoal(goalData, availableHoursPerWeek = 10) {
    try {
      // Validate inputs
      if (!goalData || !goalData.title) {
        throw new Error('Goal title is required');
      }

      // Sanitize time availability
      const sanitizedHours = sanitizeTimeAllocation(availableHoursPerWeek, 40); // Max 40 hours per week

      // Build structured prompt
      const prompt = this._buildPrompt(goalData, sanitizedHours);

      // Call AI client
      const response = await aiClient.makeRequest(prompt, {
        temperature: 0.4,
        maxTokens: 2500,
        systemPrompt: 'You are a goal planning expert. Return only valid JSON with structured milestones, habits, and weekly plans.'
      });

      // Validate response
      const validation = validateGoalDecomposition(response);
      if (!validation.valid) {
        console.error('Goal decomposition validation errors:', validation.errors);
        return this._getFallbackPlan(goalData, sanitizedHours);
      }

      // Sanitize and return
      return this._sanitizeResponse(response, sanitizedHours);

    } catch (error) {
      console.error('Goal decomposition error:', error.message);
      return this._getFallbackPlan(goalData, availableHoursPerWeek);
    }
  }

  /**
   * Build AI prompt for goal decomposition
   */
  _buildPrompt(goalData, availableHours) {
    const timeToTarget = goalData.targetDate 
      ? Math.ceil((new Date(goalData.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 7))
      : 12; // Default 12 weeks

    return `Analyze this goal and create a structured action plan.

Goal Details:
- Title: ${goalData.title}
- Description: ${goalData.description || 'Not provided'}
- Category: ${goalData.category || 'general'}
- Target Date: ${goalData.targetDate ? new Date(goalData.targetDate).toLocaleDateString() : 'Not set'}
- Available Time: ${availableHours} hours per week
- Weeks Available: ${timeToTarget}

Create a realistic plan that includes:
1. Major milestones (3-5 key checkpoints)
2. Supporting daily habits
3. Weekly time breakdown

Return ONLY valid JSON in this exact format:
{
  "milestones": [
    {
      "title": "Milestone name",
      "deadline": "YYYY-MM-DD",
      "tasks": ["Task 1", "Task 2"],
      "description": "Brief description"
    }
  ],
  "suggestedHabits": [
    {
      "name": "Habit name",
      "frequency": "daily|weekly",
      "timeRequired": 30,
      "rationale": "Why this habit supports the goal"
    }
  ],
  "weeklyPlan": {
    "totalHoursNeeded": 8,
    "dailyBreakdown": [
      {
        "day": "Monday",
        "activities": ["Activity 1", "Activity 2"],
        "estimatedHours": 1.5
      }
    ],
    "priorityTasks": ["High priority task 1", "High priority task 2"]
  }
}

IMPORTANT:
- Be realistic with time estimates
- Total weekly hours must not exceed ${availableHours}
- Milestones must be achievable within ${timeToTarget} weeks
- All time values in hours (can use decimals)
- Return ONLY the JSON object, no additional text`;
  }

  /**
   * Sanitize AI response
   */
  _sanitizeResponse(response, maxHours) {
    // Ensure weekly hours don't exceed availability
    if (response.weeklyPlan && response.weeklyPlan.totalHoursNeeded > maxHours) {
      const scaleFactor = maxHours / response.weeklyPlan.totalHoursNeeded;
      
      response.weeklyPlan.totalHoursNeeded = maxHours;
      
      if (response.weeklyPlan.dailyBreakdown) {
        response.weeklyPlan.dailyBreakdown = response.weeklyPlan.dailyBreakdown.map(day => ({
          ...day,
          estimatedHours: Math.round((day.estimatedHours * scaleFactor) * 10) / 10
        }));
      }
    }

    // Sanitize habit time requirements
    if (response.suggestedHabits) {
      response.suggestedHabits = response.suggestedHabits.map(habit => ({
        ...habit,
        timeRequired: Math.min(habit.timeRequired || 30, 120) // Max 2 hours per habit
      }));
    }

    return response;
  }

  /**
   * Fallback plan when AI fails
   */
  _getFallbackPlan(goalData, availableHours) {
    const weeksAvailable = goalData.targetDate 
      ? Math.ceil((new Date(goalData.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 7))
      : 12;

    const milestone1Date = new Date();
    milestone1Date.setDate(milestone1Date.getDate() + Math.floor(weeksAvailable * 7 / 3));
    
    const milestone2Date = new Date();
    milestone2Date.setDate(milestone2Date.getDate() + Math.floor(weeksAvailable * 7 * 2 / 3));

    return {
      milestones: [
        {
          title: `Initial Progress - ${goalData.title}`,
          deadline: milestone1Date.toISOString().split('T')[0],
          tasks: [
            'Research and planning',
            'Set up necessary resources',
            'Complete initial phase'
          ],
          description: 'Foundation phase'
        },
        {
          title: `Midpoint Checkpoint - ${goalData.title}`,
          deadline: milestone2Date.toISOString().split('T')[0],
          tasks: [
            'Review progress',
            'Adjust approach if needed',
            'Complete core work'
          ],
          description: 'Development phase'
        },
        {
          title: `Complete ${goalData.title}`,
          deadline: goalData.targetDate ? new Date(goalData.targetDate).toISOString().split('T')[0] : new Date(Date.now() + weeksAvailable * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tasks: [
            'Final review',
            'Polish and refine',
            'Achieve goal'
          ],
          description: 'Completion phase'
        }
      ],
      suggestedHabits: [
        {
          name: `Daily work on ${goalData.category || 'goal'}`,
          frequency: 'daily',
          timeRequired: 30,
          rationale: 'Consistent daily effort builds momentum'
        },
        {
          name: 'Weekly progress review',
          frequency: 'weekly',
          timeRequired: 15,
          rationale: 'Regular reflection ensures you stay on track'
        }
      ],
      weeklyPlan: {
        totalHoursNeeded: Math.min(availableHours, 10),
        dailyBreakdown: [
          { day: 'Monday', activities: ['Plan week', 'Start priority task'], estimatedHours: 1.5 },
          { day: 'Tuesday', activities: ['Continue core work'], estimatedHours: 1.5 },
          { day: 'Wednesday', activities: ['Continue core work'], estimatedHours: 1.5 },
          { day: 'Thursday', activities: ['Continue core work'], estimatedHours: 1.5 },
          { day: 'Friday', activities: ['Complete tasks', 'Review progress'], estimatedHours: 2 },
          { day: 'Saturday', activities: ['Additional work if needed'], estimatedHours: 1 },
          { day: 'Sunday', activities: ['Rest and plan ahead'], estimatedHours: 1 }
        ],
        priorityTasks: [
          'Identify most impactful actions',
          'Focus on core milestones',
          'Build supporting habits'
        ]
      },
      fallback: true
    };
  }
}

module.exports = new GoalDecomposer();
