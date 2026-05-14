const axios = require('axios');

/**
 * Centralized AI Client for LLM communication
 * Provider-agnostic wrapper with timeout and error handling
 */
class AIClient {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'anthropic'; // anthropic, openai, etc.
    this.apiKey = process.env.AI_API_KEY;
    this.timeout = parseInt(process.env.AI_TIMEOUT) || 30000; // 30 seconds default
    this.maxRetries = parseInt(process.env.AI_MAX_RETRIES) || 2;
    
    if (!this.apiKey) {
      console.warn('AI_API_KEY not set. AI features will be disabled.');
    }
  }

  /**
   * Check if AI client is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Make AI request with retry logic
   */
  async makeRequest(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI client not configured. Please set AI_API_KEY environment variable.');
    }

    const {
      temperature = 0.3, // Lower temperature for more deterministic outputs
      maxTokens = 2000,
      systemPrompt = 'You are a structured AI assistant that returns only valid JSON responses.',
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this._callProvider(prompt, {
          temperature,
          maxTokens,
          systemPrompt,
        });
        
        return response;
      } catch (error) {
        lastError = error;
        console.error(`AI request attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await this._delay(1000 * Math.pow(2, attempt - 1));
        }
      }
    }

    throw new Error(`AI request failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Call the configured AI provider
   */
  async _callProvider(prompt, options) {
    switch (this.provider) {
      case 'anthropic':
        return await this._callAnthropic(prompt, options);
      case 'openai':
        return await this._callOpenAI(prompt, options);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Call Anthropic Claude API
   */
  async _callAnthropic(prompt, options) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          system: options.systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: this.timeout
        }
      );

      // Extract text from response
      const content = response.data.content[0].text;
      return this._extractJSON(content);
    } catch (error) {
      if (error.response) {
        throw new Error(`Anthropic API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('AI request timeout');
      } else {
        throw new Error(`AI request failed: ${error.message}`);
      }
    }
  }

  /**
   * Call OpenAI API
   */
  async _callOpenAI(prompt, options) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.AI_MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: this.timeout
        }
      );

      const content = response.data.choices[0].message.content;
      return this._extractJSON(content);
    } catch (error) {
      if (error.response) {
        throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('AI request timeout');
      } else {
        throw new Error(`AI request failed: ${error.message}`);
      }
    }
  }

  /**
   * Extract JSON from AI response
   * Handles markdown code blocks and extra text
   */
  _extractJSON(content) {
    try {
      // Try direct parse first
      return JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON object in text
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      throw new Error('No valid JSON found in AI response');
    }
  }

  /**
   * Delay helper for retry logic
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate that response contains expected fields
   */
  validateResponse(response, requiredFields = []) {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid AI response: not an object');
    }

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Invalid AI response: missing required field '${field}'`);
      }
    }

    return true;
  }
}

// Export singleton instance
module.exports = new AIClient();
