import OpenAI from 'openai';
import config from '../config/index.js';

/**
 * OpenAI Client Utility
 * 
 * Why: Centralized OpenAI client initialization and configuration.
 * This utility:
 * - Initializes OpenAI client with API key from config
 * - Provides reusable methods for AI interactions
 * - Handles errors consistently
 * - Manages API rate limits and retries
 * 
 * Security:
 * - API key comes from environment variables (not hardcoded)
 * - Config validation ensures key is present before server starts
 */
let openaiClient = null;

/**
 * Get or create OpenAI client instance
 * @returns {OpenAI} OpenAI client instance
 */
export function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Call OpenAI API with a prompt
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {Object} options - Additional options (model, temperature, max_tokens)
 * @returns {Promise<string>} AI response text
 * @throws {Error} If API call fails
 */
export async function callOpenAI(prompt, options = {}) {
  const client = getOpenAIClient();

  const {
    model = 'gpt-4o-mini', // Cost-effective model with good performance
    temperature = 0.7, // Balance between creativity and consistency
    max_tokens = 2000, // Limit response length
  } = options;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens,
      response_format: { type: 'json_object' }, // Request JSON response
    });

    // Check for response structure issues
    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('OpenAI response missing content. Response structure: ' + JSON.stringify(response));
    }

    return response.choices[0].message.content;
  } catch (error) {
    // Enhanced error logging
    console.error('OpenAI API Error - Full Error Object:', error);
    console.error('OpenAI API Error - Properties:', {
      name: error.name,
      message: error.message,
      status: error.status,
      responseStatus: error.response?.status,
      statusCode: error.statusCode,
      code: error.code,
      type: error.type,
      cause: error.cause,
      errorType: typeof error,
      constructor: error.constructor?.name,
      allKeys: Object.keys(error),
    });
    
    // OpenAI SDK v4 uses error.status directly, but check all possibilities
    const status = error.status || error.response?.status || error.statusCode || error.cause?.status;
    const errorCode = error.code || error.error?.code;
    
    // Handle different error types with appropriate status codes
    if (status === 429) {
      // Distinguish between rate limit and quota issues
      if (errorCode === 'insufficient_quota' || error.type === 'insufficient_quota') {
        const quotaError = new Error('OpenAI API quota exceeded. Please check your billing and plan details.');
        quotaError.statusCode = 429;
        throw quotaError;
      } else {
        const rateLimitError = new Error('OpenAI API rate limit exceeded. Please try again later.');
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
    }
    if (status === 401) {
      const authError = new Error('OpenAI API key is invalid. Please check your configuration.');
      authError.statusCode = 401;
      throw authError;
    }
    
    // Re-throw with more context and proper status code
    const errorMessage = error.message || 'Unknown OpenAI API error';
    const apiError = new Error(`OpenAI API error: ${errorMessage}`);
    apiError.statusCode = status || 500;
    throw apiError;
  }
}

/**
 * Parse and validate JSON response from OpenAI
 * @param {string} jsonString - JSON string from OpenAI
 * @returns {Object} Parsed JSON object
 * @throws {Error} If JSON is invalid
 */
export function parseAIResponse(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error(`Invalid JSON string input: ${typeof jsonString}`);
  }
  try {
    // Remove any markdown code blocks if present
    const cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

