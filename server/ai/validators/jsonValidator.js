/**
 * JSON Validation Utility
 * Validates AI responses against expected schemas
 */

/**
 * Validate goal decomposition response
 */
function validateGoalDecomposition(data) {
  const errors = [];

  // Check top-level structure
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  // Validate milestones
  if (!Array.isArray(data.milestones)) {
    errors.push('milestones must be an array');
  } else {
    data.milestones.forEach((milestone, index) => {
      if (!milestone.title || typeof milestone.title !== 'string') {
        errors.push(`milestones[${index}].title is required and must be a string`);
      }
      if (!milestone.deadline || typeof milestone.deadline !== 'string') {
        errors.push(`milestones[${index}].deadline is required and must be a string`);
      }
      if (!Array.isArray(milestone.tasks)) {
        errors.push(`milestones[${index}].tasks must be an array`);
      }
    });
  }

  // Validate suggested habits
  if (!Array.isArray(data.suggestedHabits)) {
    errors.push('suggestedHabits must be an array');
  } else {
    data.suggestedHabits.forEach((habit, index) => {
      if (!habit.name || typeof habit.name !== 'string') {
        errors.push(`suggestedHabits[${index}].name is required`);
      }
      if (!habit.frequency || typeof habit.frequency !== 'string') {
        errors.push(`suggestedHabits[${index}].frequency is required`);
      }
    });
  }

  // Validate weekly plan
  if (!data.weeklyPlan || typeof data.weeklyPlan !== 'object') {
    errors.push('weeklyPlan is required and must be an object');
  } else {
    if (typeof data.weeklyPlan.totalHoursNeeded !== 'number' || data.weeklyPlan.totalHoursNeeded < 0) {
      errors.push('weeklyPlan.totalHoursNeeded must be a positive number');
    }
    if (!Array.isArray(data.weeklyPlan.dailyBreakdown)) {
      errors.push('weeklyPlan.dailyBreakdown must be an array');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate behavioral analysis response
 */
function validateBehavioralAnalysis(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  // Validate consistency score
  if (typeof data.consistencyScore !== 'number' || data.consistencyScore < 0 || data.consistencyScore > 100) {
    errors.push('consistencyScore must be a number between 0 and 100');
  }

  // Validate patterns
  if (!Array.isArray(data.patterns)) {
    errors.push('patterns must be an array');
  }

  // Validate insights
  if (!Array.isArray(data.insights)) {
    errors.push('insights must be an array');
  } else {
    data.insights.forEach((insight, index) => {
      if (!insight.type || typeof insight.type !== 'string') {
        errors.push(`insights[${index}].type is required`);
      }
      if (!insight.message || typeof insight.message !== 'string') {
        errors.push(`insights[${index}].message is required`);
      }
    });
  }

  // Validate recommendations
  if (!Array.isArray(data.recommendations)) {
    errors.push('recommendations must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate planning optimization response
 */
function validatePlanningOptimization(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  // Validate optimized workload
  if (typeof data.optimizedWorkload !== 'number' || data.optimizedWorkload < 0) {
    errors.push('optimizedWorkload must be a non-negative number');
  }

  // Validate adjusted tasks
  if (!Array.isArray(data.adjustedTasks)) {
    errors.push('adjustedTasks must be an array');
  } else {
    data.adjustedTasks.forEach((task, index) => {
      if (!task.title || typeof task.title !== 'string') {
        errors.push(`adjustedTasks[${index}].title is required`);
      }
      if (!task.priority || typeof task.priority !== 'string') {
        errors.push(`adjustedTasks[${index}].priority is required`);
      }
      if (typeof task.estimatedTime !== 'number' || task.estimatedTime <= 0) {
        errors.push(`adjustedTasks[${index}].estimatedTime must be a positive number`);
      }
    });
  }

  // Validate feasibility
  if (!data.feasibility || typeof data.feasibility !== 'object') {
    errors.push('feasibility object is required');
  } else {
    if (typeof data.feasibility.isFeasible !== 'boolean') {
      errors.push('feasibility.isFeasible must be a boolean');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate reflection analysis response
 */
function validateReflectionAnalysis(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  // Validate sentiment
  if (!data.sentiment || typeof data.sentiment !== 'object') {
    errors.push('sentiment object is required');
  } else {
    if (!data.sentiment.overall || typeof data.sentiment.overall !== 'string') {
      errors.push('sentiment.overall is required');
    }
    if (typeof data.sentiment.confidence !== 'number' || data.sentiment.confidence < 0 || data.sentiment.confidence > 1) {
      errors.push('sentiment.confidence must be a number between 0 and 1');
    }
  }

  // Validate themes
  if (!Array.isArray(data.themes)) {
    errors.push('themes must be an array');
  }

  // Validate actionable insights
  if (!Array.isArray(data.actionableInsights)) {
    errors.push('actionableInsights must be an array');
  } else {
    data.actionableInsights.forEach((insight, index) => {
      if (!insight.category || typeof insight.category !== 'string') {
        errors.push(`actionableInsights[${index}].category is required`);
      }
      if (!insight.suggestion || typeof insight.suggestion !== 'string') {
        errors.push(`actionableInsights[${index}].suggestion is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize numeric values to prevent unrealistic outputs
 */
function sanitizeNumericValue(value, min, max, defaultValue) {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Sanitize time allocation to ensure feasibility
 */
function sanitizeTimeAllocation(hours, maxHoursPerWeek = 168) {
  return sanitizeNumericValue(hours, 0, maxHoursPerWeek, 0);
}

module.exports = {
  validateGoalDecomposition,
  validateBehavioralAnalysis,
  validatePlanningOptimization,
  validateReflectionAnalysis,
  sanitizeNumericValue,
  sanitizeTimeAllocation
};
