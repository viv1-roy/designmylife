const aiClient = require('../aiClient');
const { validateReflectionAnalysis } = require('../validators/jsonValidator');

/**
 * Reflection Analyzer Module
 * Analyzes user journal/reflection text for emotional insights and actionable suggestions
 */

class ReflectionAnalyzer {
  /**
   * Analyze reflection text
   * @param {string} reflectionText - User's reflection or journal entry
   * @param {Object} context - Optional context (goals, recent progress, etc.)
   * @returns {Promise<Object>} Analysis with insights and suggestions
   */
  async analyzeReflection(reflectionText, context = {}) {
    try {
      // Validate input
      if (!reflectionText || typeof reflectionText !== 'string' || reflectionText.trim().length === 0) {
        throw new Error('Reflection text is required');
      }

      if (reflectionText.length > 5000) {
        reflectionText = reflectionText.substring(0, 5000); // Limit length
      }

      // Build structured prompt
      const prompt = this._buildPrompt(reflectionText, context);

      // Call AI client with neutral, supportive system prompt
      const response = await aiClient.makeRequest(prompt, {
        temperature: 0.4,
        maxTokens: 1500,
        systemPrompt: 'You are a supportive life coach providing neutral, constructive feedback. Return only valid JSON with structured insights.'
      });

      // Validate response
      const validation = validateReflectionAnalysis(response);
      if (!validation.valid) {
        console.error('Reflection analysis validation errors:', validation.errors);
        return this._getFallbackAnalysis(reflectionText);
      }

      return response;

    } catch (error) {
      console.error('Reflection analysis error:', error.message);
      return this._getFallbackAnalysis(reflectionText);
    }
  }

  /**
   * Build AI prompt for reflection analysis
   */
  _buildPrompt(reflectionText, context) {
    return `Analyze the following reflection entry and provide supportive, neutral insights.

Reflection Entry:
"""
${reflectionText}
"""

${context.recentGoals ? `
Recent Goals Context:
${context.recentGoals.map(g => `- ${g.title} (${g.progress}% complete)`).join('\n')}
` : ''}

${context.recentHabits ? `
Recent Habit Performance:
${context.recentHabits.map(h => `- ${h.name}: ${h.currentStreak} day streak`).join('\n')}
` : ''}

Provide a thoughtful, neutral analysis that helps the user gain clarity and take action.

Return ONLY valid JSON in this exact format:
{
  "sentiment": {
    "overall": "positive|neutral|mixed|reflective|concerned",
    "confidence": 0.85,
    "nuances": ["Specific emotional nuance 1", "Nuance 2"]
  },
  "themes": [
    {
      "category": "progress|challenge|motivation|planning|reflection",
      "description": "Clear description of theme",
      "significance": "high|medium|low"
    }
  ],
  "actionableInsights": [
    {
      "category": "mindset|action|habit|goal",
      "suggestion": "Specific, actionable suggestion",
      "priority": "high|medium|low",
      "rationale": "Why this matters"
    }
  ],
  "emotionalSupport": {
    "acknowledgment": "Validating statement about their feelings/situation",
    "encouragement": "Supportive message",
    "perspective": "Helpful reframing or context"
  },
  "nextSteps": [
    "Concrete next step 1",
    "Concrete next step 2",
    "Concrete next step 3"
  ]
}

IMPORTANT GUIDELINES:
- Be neutral and supportive, never judgmental
- Base insights on actual content, don't fabricate
- Acknowledge both challenges and progress
- Provide actionable, specific suggestions
- Maintain professional, empathetic tone
- Return ONLY the JSON object`;
  }

  /**
   * Fallback analysis when AI fails
   */
  _getFallbackAnalysis(reflectionText) {
    // Basic sentiment detection
    const positiveWords = /\b(great|good|happy|excited|proud|accomplished|success|better|progress|achieve)\b/gi;
    const negativeWords = /\b(difficult|hard|struggle|frustrated|overwhelmed|stressed|worried|failed|behind)\b/gi;
    const reflectiveWords = /\b(think|realize|understand|learn|notice|reflect|consider)\b/gi;

    const positiveMatches = (reflectionText.match(positiveWords) || []).length;
    const negativeMatches = (reflectionText.match(negativeWords) || []).length;
    const reflectiveMatches = (reflectionText.match(reflectiveWords) || []).length;

    let overall = 'neutral';
    if (positiveMatches > negativeMatches + 2) overall = 'positive';
    else if (negativeMatches > positiveMatches + 2) overall = 'concerned';
    else if (reflectiveMatches > 3) overall = 'reflective';
    else if (positiveMatches > 0 && negativeMatches > 0) overall = 'mixed';

    const wordCount = reflectionText.split(/\s+/).length;
    const hasPlans = /\b(will|plan|going to|next|tomorrow|goal)\b/i.test(reflectionText);
    const hasChallenges = /\b(but|however|although|challenge|difficult)\b/i.test(reflectionText);

    return {
      sentiment: {
        overall,
        confidence: 0.6,
        nuances: [
          positiveMatches > 0 ? 'Shows awareness of progress' : null,
          negativeMatches > 0 ? 'Acknowledges challenges' : null,
          reflectiveMatches > 2 ? 'Demonstrates self-reflection' : null
        ].filter(Boolean)
      },
      themes: [
        {
          category: hasPlans ? 'planning' : 'reflection',
          description: hasPlans 
            ? 'Focused on future actions and goals'
            : 'Reflecting on current situation and feelings',
          significance: 'medium'
        },
        hasChallenges ? {
          category: 'challenge',
          description: 'Working through obstacles',
          significance: 'high'
        } : null
      ].filter(Boolean),
      actionableInsights: [
        {
          category: 'action',
          suggestion: wordCount < 50 
            ? 'Consider writing more detailed reflections to gain deeper insights'
            : 'Continue your reflection practice - it helps build self-awareness',
          priority: 'medium',
          rationale: 'Regular reflection supports personal growth'
        },
        {
          category: overall === 'concerned' ? 'mindset' : 'habit',
          suggestion: overall === 'concerned'
            ? 'Break down challenges into smaller, manageable steps'
            : 'Build on your current momentum with consistent action',
          priority: 'high',
          rationale: 'Taking action helps move forward'
        }
      ],
      emotionalSupport: {
        acknowledgment: overall === 'concerned' 
          ? 'It\'s natural to face challenges on your journey'
          : overall === 'positive'
            ? 'It\'s great that you\'re making progress'
            : 'Taking time to reflect shows commitment to growth',
        encouragement: 'You\'re investing in your personal development by reflecting on your experiences',
        perspective: 'Every reflection is a step toward better self-understanding'
      },
      nextSteps: [
        'Review your current goals and adjust if needed',
        hasPlans 
          ? 'Take the first step on your planned actions'
          : 'Identify one specific action you can take today',
        'Schedule time for your next reflection'
      ],
      fallback: true
    };
  }
}

module.exports = new ReflectionAnalyzer();
