# AI Module Documentation

## Overview

The AI module provides intelligent decision-support features for goal planning, behavioral analysis, and adaptive scheduling. It integrates seamlessly with the existing MERN architecture.

## Architecture

```
Frontend → Express API → AI Module → LLM Provider → Validated Response → Frontend
```

**Key Principle:** AI never directly manipulates the database or bypasses backend logic.

## Directory Structure

```
server/ai/
├── aiClient.js              # LLM provider wrapper
├── modules/
│   ├── goalDecomposer.js    # Convert goals to structured plans
│   ├── behaviorAnalyzer.js  # Analyze habit patterns
│   ├── planningOptimizer.js # Optimize workload
│   └── reflectionAnalyzer.js # Analyze journal entries
├── validators/
│   └── jsonValidator.js     # Validate AI responses
└── utils/
```

## Configuration

### Environment Variables

```env
# Required for AI features
AI_PROVIDER=anthropic        # anthropic or openai
AI_API_KEY=your_api_key     # Get from provider
AI_MODEL=claude-3-5-sonnet-20241022  # Model to use
AI_TIMEOUT=30000             # Request timeout (ms)
AI_MAX_RETRIES=2             # Retry attempts
```

### Supported Providers

1. **Anthropic Claude** (Recommended)
   - Provider: `anthropic`
   - Model: `claude-3-5-sonnet-20241022`
   - Best for: Structured outputs, planning

2. **OpenAI GPT**
   - Provider: `openai`
   - Model: `gpt-4` or `gpt-3.5-turbo`
   - Alternative option

## API Endpoints

### 1. Goal Decomposition

**POST** `/api/ai/decompose-goal`

Converts a goal into milestones, habits, and weekly plans.

**Request:**
```json
{
  "goalData": {
    "title": "Learn Spanish",
    "description": "Achieve conversational fluency",
    "category": "learning",
    "targetDate": "2024-12-31"
  },
  "availableHoursPerWeek": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "milestones": [
      {
        "title": "Foundation Phase",
        "deadline": "2024-06-30",
        "tasks": ["Learn basic vocabulary", "Master pronunciation"],
        "description": "Build core language skills"
      }
    ],
    "suggestedHabits": [
      {
        "name": "Daily Spanish practice",
        "frequency": "daily",
        "timeRequired": 30,
        "rationale": "Consistent daily practice builds fluency"
      }
    ],
    "weeklyPlan": {
      "totalHoursNeeded": 8,
      "dailyBreakdown": [...],
      "priorityTasks": [...]
    }
  },
  "fallback": false
}
```

### 2. Behavioral Analysis

**POST** `/api/ai/analyze-behavior`

Analyzes habit completion patterns and provides insights.

**Request:**
```json
{
  "habits": [
    {
      "name": "Morning Exercise",
      "frequency": "daily",
      "currentStreak": 7,
      "longestStreak": 14,
      "completionHistory": [...]
    }
  ],
  "metrics": {
    "bci": 75
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consistencyScore": 75,
    "patterns": [
      {
        "type": "strength",
        "description": "Strong morning routine established",
        "affectedHabits": ["Morning Exercise"]
      }
    ],
    "insights": [...],
    "recommendations": [...],
    "trendAnalysis": {
      "direction": "improving",
      "confidence": 0.85,
      "keyFactors": [...]
    }
  }
}
```

### 3. Planning Optimization

**POST** `/api/ai/optimize-plan`

Optimizes task workload based on time and consistency.

**Request:**
```json
{
  "tasks": [
    {
      "title": "Complete project report",
      "priority": "high",
      "status": "todo",
      "estimatedTime": 120
    }
  ],
  "availableHours": 15,
  "consistencyScore": 70,
  "progress": {
    "goalProgress": 45,
    "habitConsistency": 80
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimizedWorkload": 12.5,
    "adjustedTasks": [
      {
        "title": "Complete project report",
        "priority": "urgent",
        "estimatedTime": 120,
        "scheduledDay": "Monday",
        "rationale": "High priority, sufficient time"
      }
    ],
    "feasibility": {
      "isFeasible": true,
      "confidence": 0.9,
      "riskFactors": []
    },
    "recommendations": [...],
    "bufferTime": 2.5
  }
}
```

### 4. Reflection Analysis

**POST** `/api/ai/analyze-reflection`

Analyzes journal/reflection text for insights.

**Request:**
```json
{
  "reflectionText": "Today was challenging but I managed to stay consistent with my habits...",
  "context": {
    "recentGoals": [...],
    "recentHabits": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": {
      "overall": "reflective",
      "confidence": 0.85,
      "nuances": ["Shows resilience", "Self-awareness"]
    },
    "themes": [...],
    "actionableInsights": [...],
    "emotionalSupport": {
      "acknowledgment": "...",
      "encouragement": "...",
      "perspective": "..."
    },
    "nextSteps": [...]
  }
}
```

### 5. AI Status

**GET** `/api/ai/status`

Check if AI features are available.

**Response:**
```json
{
  "available": true,
  "provider": "anthropic",
  "features": {
    "goalDecomposition": true,
    "behaviorAnalysis": true,
    "planningOptimization": true,
    "reflectionAnalysis": true
  },
  "message": "AI features are available"
}
```

## Safety & Validation

### Input Validation
- All inputs are validated before AI processing
- Time constraints enforced (max 40 hours/week)
- Text length limits applied (5000 chars)

### Output Validation
- JSON schema validation for all responses
- Numeric sanity checks
- Feasibility constraints enforced
- Fallback responses when validation fails

### Error Handling
- Graceful fallback when AI unavailable
- Retry logic with exponential backoff
- Timeout protection (30s default)
- Never blocks main application flow

## Fallback Behavior

When AI is unavailable or fails:
- Returns deterministic fallback responses
- Uses rule-based logic
- Maintains feature functionality
- Marks response with `fallback: true`

Example:
```json
{
  "success": true,
  "data": { /* fallback data */ },
  "fallback": true
}
```

## Performance

### Caching
- Implement caching for repeat requests
- Cache key: hash of input parameters
- Cache duration: configurable

### Async Execution
- All AI calls are non-blocking
- Background processing for heavy operations
- Progress indicators on frontend

### Rate Limiting
- Respect provider rate limits
- Implement client-side throttling
- Queue management for bulk operations

## Usage Examples

### Frontend Integration

```javascript
import { aiAPI } from '../api/apiClient';

// Decompose a goal
const decomposeGoal = async (goalData) => {
  try {
    const response = await aiAPI.decomposeGoal({
      goalData,
      availableHoursPerWeek: 10
    });
    
    if (response.data.success) {
      const { milestones, suggestedHabits } = response.data.data;
      // Use the structured plan
    }
  } catch (error) {
    console.error('Goal decomposition failed:', error);
  }
};

// Analyze behavior
const analyzeBehavior = async (habits) => {
  const response = await aiAPI.analyzeBehavior({
    habits,
    metrics: { bci: 75 }
  });
  
  const insights = response.data.data.insights;
  // Display insights to user
};
```

## Testing

### Unit Tests
```bash
npm test -- ai/modules
```

### Integration Tests
```bash
npm test -- ai/integration
```

### Manual Testing
1. Set AI_API_KEY in .env
2. Start server: `npm run dev`
3. Test endpoints with Postman/curl

## Troubleshooting

### AI Features Not Available
- Check `AI_API_KEY` is set in .env
- Verify API key is valid
- Check provider status

### Validation Errors
- Review input format
- Check required fields
- Verify data types

### Timeout Issues
- Increase `AI_TIMEOUT` value
- Check network connectivity
- Verify provider API status

## Best Practices

1. **Always check AI status** before making requests
2. **Handle fallback responses** gracefully in UI
3. **Display loading states** during AI processing
4. **Cache results** when appropriate
5. **Validate inputs** on frontend before API calls

## Security Considerations

- API key stored in environment variables only
- Never expose API key to frontend
- All AI routes require authentication
- Input sanitization prevents injection
- Output validation prevents malicious content

## Future Enhancements

- [ ] Response caching layer
- [ ] Batch processing support
- [ ] Webhook integration
- [ ] AI model fine-tuning
- [ ] Multi-language support
- [ ] Voice input analysis

## Support

For issues or questions:
- Check server logs for errors
- Review validation error messages
- Test with fallback mode first
- Consult provider documentation
