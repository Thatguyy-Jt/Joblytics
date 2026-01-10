import { callOpenAI, parseAIResponse } from '../utils/openai.js';
import {
  getResumeMatchPrompt,
  getInterviewPrepPrompt,
  getResumeImprovementPrompt,
} from '../ai/prompts.js';
import {
  getMockResumeMatch,
  getMockInterviewPrep,
  getMockResumeImprovement,
} from '../ai/mockResponses.js';
import userRepository from '../repositories/user.repository.js';
import config from '../config/index.js';

/**
 * AI Service
 * 
 * Why: Handles all AI-related business logic separate from HTTP concerns.
 * This service:
 * - Orchestrates AI interactions with OpenAI (or mock responses)
 * - Formats prompts with user data
 * - Normalizes AI responses into structured JSON
 * - Handles AI-specific errors
 * 
 * Mock Strategy:
 * - When AI_MODE='mock': Returns realistic mock responses without calling OpenAI
 * - When AI_MODE='live': Calls OpenAI API normally
 * - Both modes use the same normalization pipeline
 * - Frontend receives identical response shapes in both modes
 * - Set AI_MODE in .env: AI_MODE=mock (default in development) or AI_MODE=live
 * 
 * Responsibilities:
 * - Load user data (resume summary) for AI prompts
 * - Call OpenAI with appropriate prompts (or use mocks)
 * - Parse and validate AI responses
 * - Normalize responses into consistent format
 * - Handle rate limits and API errors
 * 
 * Prompt Design Impact:
 * - Clear instructions → Focused, relevant responses
 * - Structured format requests → Parseable JSON output
 * - Context inclusion → Personalized, relevant suggestions
 * - Examples in prompts → Consistent response style
 */
class AIService {
  /**
   * Analyze resume match with job description
   * @param {string} userId - Authenticated user's ID
   * @param {Object} jobData - Job description data
   * @returns {Object} Match analysis with score, strengths, gaps, suggestions
   */
  async analyzeResumeMatch(userId, jobData) {
    const { jobDescription, jobTitle, company } = jobData;

    // Load user's resume summary
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const resumeSummary = user.profile?.resumeSummary || '';

    if (!resumeSummary) {
      const error = new Error('Resume summary not found. Please update your profile.');
      error.statusCode = 400;
      throw error;
    }

    // Use mock or live AI based on AI_MODE
    let parsed;
    if (config.AI_MODE === 'mock') {
      // Use mock response - no OpenAI call
      parsed = getMockResumeMatch(jobTitle, company);
    } else {
      // Generate prompt and call OpenAI
      const prompt = getResumeMatchPrompt(
        resumeSummary,
        jobDescription,
        jobTitle,
        company
      );

      const aiResponse = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1500,
      });

      // Parse AI response
      parsed = parseAIResponse(aiResponse);
    }

    // Normalize response structure (same for both mock and live)
    const normalized = {
      matchScore: this.normalizeScore(parsed.matchScore),
      strengths: this.normalizeArray(parsed.strengths),
      gaps: this.normalizeArray(parsed.gaps),
      suggestions: this.normalizeArray(parsed.suggestions),
      summary: this.normalizeString(parsed.summary),
      analyzedAt: new Date().toISOString(),
    };

    return normalized;
  }

  /**
   * Get interview preparation tips
   * @param {string} userId - Authenticated user's ID
   * @param {Object} jobData - Job description data
   * @returns {Object} Interview preparation tips
   */
  async getInterviewPrepTips(userId, jobData) {
    const { jobDescription, jobTitle, company } = jobData;

    // Load user's resume summary
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const resumeSummary = user.profile?.resumeSummary || '';

    // Use mock or live AI based on AI_MODE
    let parsed;
    if (config.AI_MODE === 'mock') {
      // Use mock response - no OpenAI call
      parsed = getMockInterviewPrep(jobTitle, company);
    } else {
      // Generate prompt and call OpenAI
      const prompt = getInterviewPrepPrompt(
        resumeSummary,
        jobDescription,
        jobTitle,
        company
      );

      const aiResponse = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Parse AI response
      parsed = parseAIResponse(aiResponse);
    }

    // Normalize response structure (same for both mock and live)
    return {
      likelyQuestions: this.normalizeArray(parsed.likelyQuestions),
      technicalTopics: this.normalizeArray(parsed.technicalTopics),
      talkingPoints: this.normalizeArray(parsed.talkingPoints),
      preparationSteps: this.normalizeArray(parsed.preparationSteps),
      questionsToAsk: this.normalizeArray(parsed.questionsToAsk),
      summary: this.normalizeString(parsed.summary),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get resume improvement suggestions
   * @param {string} userId - Authenticated user's ID
   * @param {Object} improvementData - Resume bullets and job data
   * @returns {Object} Improved resume bullets and suggestions
   */
  async getResumeImprovements(userId, improvementData) {
    const { resumeBullets, jobDescription, jobTitle } = improvementData;

    // Validate resume bullets
    if (!resumeBullets || !Array.isArray(resumeBullets) || resumeBullets.length === 0) {
      const error = new Error('Resume bullets are required and must be a non-empty array');
      error.statusCode = 400;
      throw error;
    }

    // Use mock or live AI based on AI_MODE
    let parsed;
    if (config.AI_MODE === 'mock') {
      // Use mock response - no OpenAI call
      parsed = getMockResumeImprovement(resumeBullets, jobTitle);
    } else {
      // Generate prompt and call OpenAI
      const prompt = getResumeImprovementPrompt(
        resumeBullets.join('\n'),
        jobDescription,
        jobTitle
      );

      const aiResponse = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Parse AI response
      parsed = parseAIResponse(aiResponse);
    }

    // Normalize response structure (same for both mock and live)
    return {
      improvedBullets: this.normalizeArray(parsed.improvedBullets),
      improvements: this.normalizeArray(parsed.improvements),
      keywords: this.normalizeArray(parsed.keywords),
      summary: this.normalizeString(parsed.summary),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Normalize score to ensure it's between 0-100
   */
  normalizeScore(score) {
    const num = typeof score === 'number' ? score : parseInt(score, 10);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  /**
   * Normalize array to ensure it's an array of strings
   */
  normalizeArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Normalize string to ensure it's a non-empty string
   */
  normalizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
  }
}

export default new AIService();

