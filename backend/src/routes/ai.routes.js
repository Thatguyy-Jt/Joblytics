import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  resumeMatchSchema,
  interviewPrepSchema,
  resumeImprovementSchema,
} from '../validations/ai.validation.js';

/**
 * AI Routes
 * 
 * Why: Defines HTTP endpoints for AI-powered features.
 * All routes are protected with authentication middleware to ensure
 * only authenticated users can access AI features.
 * 
 * Responsibilities:
 * - Define route paths and HTTP methods
 * - Apply validation middleware (Zod schemas)
 * - Apply authentication middleware (all routes protected)
 * - Wire routes to controller methods
 * 
 * AI Features:
 * - Resume match analysis: Compare resume with job description
 * - Interview preparation: Get personalized interview tips
 * - Resume improvement: Improve resume bullets for specific jobs
 */
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Async error wrapper - catches errors from async route handlers
 * Without this, unhandled promise rejections in async handlers cause silent 500 errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * POST /api/ai/resume-match
 * Analyze how well user's resume matches a job description
 * - Protected route (requires authentication)
 * - Validates job description, title, and company
 * - Returns match score, strengths, gaps, and suggestions
 */
router.post(
  '/resume-match',
  validate(resumeMatchSchema),
  asyncHandler(aiController.analyzeResumeMatch.bind(aiController))
);

/**
 * POST /api/ai/interview-prep
 * Get personalized interview preparation tips
 * - Protected route (requires authentication)
 * - Validates job description, title, and company
 * - Returns questions, topics, talking points, and preparation steps
 */
router.post(
  '/interview-prep',
  validate(interviewPrepSchema),
  asyncHandler(aiController.getInterviewPrep.bind(aiController))
);

/**
 * POST /api/ai/resume-improvement
 * Get suggestions to improve resume bullets
 * - Protected route (requires authentication)
 * - Validates resume bullets, job description, and title
 * - Returns improved bullets, improvements, and keywords
 */
router.post(
  '/resume-improvement',
  validate(resumeImprovementSchema),
  asyncHandler(aiController.getResumeImprovement.bind(aiController))
);

export default router;

