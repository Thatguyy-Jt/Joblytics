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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:40',message:'callOpenAI entry',data:{promptLen:prompt?.length,hasApiKey:!!config.OPENAI_API_KEY,model:options.model||'gpt-4o-mini'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const client = getOpenAIClient();

  const {
    model = 'gpt-4o-mini', // Cost-effective model with good performance
    temperature = 0.7, // Balance between creativity and consistency
    max_tokens = 2000, // Limit response length
  } = options;

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:52',message:'before API call',data:{model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:66',message:'API call success',data:{hasResponse:!!response,hasChoices:!!response?.choices,choicesLength:response?.choices?.length,hasFirstChoice:!!response?.choices?.[0],hasMessage:!!response?.choices?.[0]?.message,hasContent:!!response?.choices?.[0]?.message?.content},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Check for response structure issues
    if (!response?.choices?.[0]?.message?.content) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:70',message:'missing content in response',data:{responseKeys:Object.keys(response||{}),choicesLength:response?.choices?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw new Error('OpenAI response missing content. Response structure: ' + JSON.stringify(response));
    }

    return response.choices[0].message.content;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:77',message:'OpenAI error caught',data:{errorName:error?.name,errorMessage:error?.message,errorStatus:error?.status,errorResponseStatus:error?.response?.status,errorStatusCode:error?.statusCode,errorCode:error?.code,errorType:error?.type,errorKeys:Object.keys(error||{}),errorStack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:95',message:'parseAIResponse entry',data:{hasJsonString:!!jsonString,jsonStringType:typeof jsonString,jsonStringLen:jsonString?.length,jsonStringPreview:jsonString?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!jsonString || typeof jsonString !== 'string') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:99',message:'invalid jsonString input',data:{jsonStringType:typeof jsonString,jsonStringValue:jsonString},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    throw new Error(`Invalid JSON string input: ${typeof jsonString}`);
  }
  try {
    // Remove any markdown code blocks if present
    const cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:105',message:'before JSON.parse',data:{cleanedLen:cleaned?.length,cleanedPreview:cleaned?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const parsed = JSON.parse(cleaned);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:108',message:'JSON.parse success',data:{hasParsed:!!parsed,parsedKeys:Object.keys(parsed||{}),parsedType:typeof parsed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return parsed;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55c1da56-fa20-423b-86db-f3d5b4fb5ec7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'openai.js:111',message:'JSON.parse error',data:{errorMessage:error?.message,errorName:error?.name,jsonStringPreview:jsonString?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

