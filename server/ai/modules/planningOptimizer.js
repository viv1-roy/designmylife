const aiClient = require('../aiClient');
const { validatePlanningOptimization, sanitizeTimeAllocation } = require('../validators/jsonValidator');

/**
 * Planning Optimizer Module
 * Optimizes workload based on progress, consistency, and time availability
 */

class PlanningOptimizer {
  /**
   * Optimize planning workload
   * @param {Object} data - Planning data
   * @param {Array} data.tasks - Current tasks
   * @param {number} data.availableHours - Available hours this week
   * @param {Object} data.progress - Current progress metrics
   * @param {number} data.consistencyScore - User's consistency score
   * @returns {Promise<Object>} Optimized plan
   */
  async optimizePlan(data) {
    try {
      // Validate inputs
      if (!data || !data.tasks) {
        throw new Error('Task data is required');
      }

      // Sanitize time availability
      const sanitizedHours = sanitizeTimeAllocation(data.availableHours || 10, 40);

      // Build structured prompt
      const prompt = this._buildPrompt(data, sanitizedHours);

      // Call AI client
      const response = await aiClient.makeRequest(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt: 'You are a productivity optimization expert. Return only valid JSON with realistic, achievable plans.'
      });

      // Validate response
      const validation = validatePlanningOptimization(response);
      if (!validation.valid) {
        console.error('Planning optimization validation errors:', validation.errors);
        return this._getFallbackPlan(data, sanitizedHours);
      }

      // Ensure feasibility constraints
      return this._enforceFeasibility(response, sanitizedHours);

    } catch (error) {
      console.error('Planning optimization error:', error.message);
      return this._getFallbackPlan(data, data.availableHours || 10);
    }
  }

  /**
   * Build AI prompt for planning optimization
   */
  _buildPrompt(data, availableHours) {
    const { tasks, progress, consistencyScore } = data;

    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return `Optimize the following task plan to fit within available time while maximizing productivity.

Current Situation:
- Available Time: ${availableHours} hours this week
- Total Estimated Time for All Tasks: ${totalEstimatedTime} minutes (${Math.round(totalEstimatedTime / 60)} hours)
- Tasks Pending: ${tasks.filter(t => t.status !== 'completed').length}
- Tasks Completed: ${completedTasks}
- Completion Rate: ${Math.round(completionRate)}%
- User Consistency Score: ${consistencyScore || 50}/100

Task List:
${tasks.map((task, idx) => `
${idx + 1}. ${task.title}
   Priority: ${task.priority}
   Status: ${task.status}
   Estimated Time: ${task.estimatedTime || 30} minutes
   ${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No deadline'}
`).join('\n')}

${progress ? `
Progress Metrics:
- Current Goal Progress: ${progress.goalProgress || 0}%
- Habit Consistency: ${progress.habitConsistency || 0}%
` : ''}

Create an optimized plan that:
1. Prioritizes tasks based on urgency and impact
2. Fits within ${availableHours} hours
3. Considers user's consistency score
4. Balances workload to prevent burnout

Return ONLY valid JSON in this exact format:
{
  "optimizedWorkload": 8.5,
  "adjustedTasks": [
    {
      "title": "Task title",
      "priority": "urgent|high|medium|low",
      "estimatedTime": 60,
      "scheduledDay": "Monday|Tuesday|etc",
      "rationale": "Why this timing/priority"
    }
  ],
  "feasibility": {
    "isFeasible": true,
    "confidence": 0.85,
    "riskFactors": ["Factor 1", "Factor 2"]
  },
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "bufferTime": 1.5
}

CRITICAL CONSTRAINTS:
- optimizedWorkload MUST be <= ${availableHours} hours
- Include buffer time for unexpected delays
- If user consistency is low (<50), reduce workload by 20%
- All time in hours (use decimals)
- Return ONLY the JSON object`;
  }

  /**
   * Enforce feasibility constraints
   */
  _enforceFeasibility(response, maxHours) {
    // Ensure workload doesn't exceed available hours
    if (response.optimizedWorkload > maxHours) {
      const scaleFactor = (maxHours * 0.9) / response.optimizedWorkload; // Use 90% to add buffer
      
      response.optimizedWorkload = maxHours * 0.9;
      
      // Scale down task times proportionally
      if (response.adjustedTasks) {
        response.adjustedTasks = response.adjustedTasks.map(task => ({
          ...task,
          estimatedTime: Math.round((task.estimatedTime || 30) * scaleFactor)
        }));
      }

      // Update feasibility
      response.feasibility.isFeasible = true;
      response.feasibility.riskFactors = [
        ...(response.feasibility.riskFactors || []),
        'Workload was reduced to fit time constraints'
      ];
    }

    // Ensure buffer time exists
    if (!response.bufferTime || response.bufferTime < 0) {
      response.bufferTime = Math.max(1, maxHours * 0.15); // 15% buffer
    }

    // Validate task times
    if (response.adjustedTasks) {
      response.adjustedTasks = response.adjustedTasks.map(task => ({
        ...task,
        estimatedTime: Math.max(15, Math.min(task.estimatedTime || 30, 180)) // Between 15 min and 3 hours
      }));
    }

    return response;
  }

  /**
   * Fallback plan when AI fails
   */
  _getFallbackPlan(data, availableHours) {
    const { tasks, consistencyScore } = data;

    // Reduce workload for low consistency users
    const workloadFactor = (consistencyScore || 50) < 50 ? 0.7 : 0.85;
    const targetWorkload = Math.round(availableHours * workloadFactor * 10) / 10;

    // Sort tasks by priority
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 };
    const sortedTasks = [...tasks].sort((a, b) => {
      const aPriority = priorityMap[a.priority] || 2;
      const bPriority = priorityMap[b.priority] || 2;
      return bPriority - aPriority;
    });

    // Select tasks that fit within time
    const adjustedTasks = [];
    let totalTime = 0;
    const targetMinutes = targetWorkload * 60;

    for (const task of sortedTasks) {
      if (task.status === 'completed') continue;
      
      const taskTime = task.estimatedTime || 30;
      if (totalTime + taskTime <= targetMinutes) {
        adjustedTasks.push({
          title: task.title,
          priority: task.priority,
          estimatedTime: taskTime,
          scheduledDay: this._assignDay(adjustedTasks.length),
          rationale: 'Selected based on priority and time availability'
        });
        totalTime += taskTime;
      }
    }

    return {
      optimizedWorkload: Math.round(totalTime / 60 * 10) / 10,
      adjustedTasks,
      feasibility: {
        isFeasible: true,
        confidence: 0.75,
        riskFactors: adjustedTasks.length < tasks.filter(t => t.status !== 'completed').length 
          ? ['Some tasks were deferred due to time constraints']
          : []
      },
      recommendations: [
        adjustedTasks.length < 3 
          ? 'Focus on completing your top priorities first'
          : 'Distribute tasks evenly throughout the week',
        'Build buffer time for unexpected challenges',
        consistencyScore < 50 
          ? 'Start with fewer tasks to build consistency'
          : 'Maintain your current pace'
      ],
      bufferTime: Math.round(availableHours * 0.15 * 10) / 10,
      fallback: true
    };
  }

  /**
   * Assign task to a day of the week
   */
  _assignDay(index) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index % 7];
  }
}

module.exports = new PlanningOptimizer();
