import express from 'express';
import jobApplicationController from '../controllers/jobApplication.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createJobApplicationSchema,
  updateJobApplicationSchema,
  jobApplicationIdParamSchema,
  getJobApplicationsQuerySchema,
  resumeImprovementBodySchema,
} from '../validations/jobApplication.validation.js';

/**
 * Job Application Routes
 * 
 * Why: Defines HTTP endpoints for job application operations.
 * All routes are protected with authentication middleware to ensure
 * only authenticated users can access their applications.
 * 
 * Responsibilities:
 * - Define route paths and HTTP methods
 * - Apply validation middleware (Zod schemas)
 * - Apply authentication middleware (all routes protected)
 * - Wire routes to controller methods
 * 
 * Ownership Enforcement:
 * - All routes require authentication (authenticate middleware)
 * - userId is extracted from req.user (set by authenticate middleware)
 * - Service layer enforces ownership - users can only access their own applications
 */
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/applications
 * Create a new job application
 * - Protected route (requires authentication)
 * - Validates request body
 * - Automatically associates application with authenticated user
 */
router.post(
  '/',
  validate(createJobApplicationSchema),
  jobApplicationController.create.bind(jobApplicationController)
);

/**
 * GET /api/applications
 * Get all applications for authenticated user
 * - Protected route (requires authentication)
 * - Validates query parameters (pagination, filtering)
 * - Returns only applications owned by authenticated user
 */
router.get(
  '/',
  validate(getJobApplicationsQuerySchema),
  jobApplicationController.getAll.bind(jobApplicationController)
);

/**
 * GET /api/applications/statistics
 * Get application statistics for authenticated user
 * - Protected route (requires authentication)
 * - Returns statistics only for authenticated user's applications
 */
router.get(
  '/statistics',
  jobApplicationController.getStatistics.bind(jobApplicationController)
);

/**
 * GET /api/applications/:applicationId
 * Get application by ID
 * - Protected route (requires authentication)
 * - Validates application ID parameter
 * - Returns 404 if application doesn't exist or user doesn't own it
 */
router.get(
  '/:applicationId',
  validate(jobApplicationIdParamSchema),
  jobApplicationController.getById.bind(jobApplicationController)
);

/**
 * PUT /api/applications/:applicationId
 * Update application
 * - Protected route (requires authentication)
 * - Validates application ID parameter and request body
 * - Returns 404 if application doesn't exist or user doesn't own it
 */
router.put(
  '/:applicationId',
  validate(jobApplicationIdParamSchema),
  validate(updateJobApplicationSchema),
  jobApplicationController.update.bind(jobApplicationController)
);

/**
 * DELETE /api/applications/:applicationId
 * Delete application
 * - Protected route (requires authentication)
 * - Validates application ID parameter
 * - Returns 404 if application doesn't exist or user doesn't own it
 */
router.delete(
  '/:applicationId',
  validate(jobApplicationIdParamSchema),
  jobApplicationController.delete.bind(jobApplicationController)
);

/**
 * POST /api/applications/:applicationId/ai/resume-match
 * Generate and persist resume match analysis for a job application
 * - Protected route (requires authentication)
 * - Validates application ID parameter
 * - Returns 404 if application doesn't exist or user doesn't own it
 * - Requires jobDescription field in the application
 */
router.post(
  '/:applicationId/ai/resume-match',
  validate(jobApplicationIdParamSchema),
  jobApplicationController.generateResumeMatch.bind(jobApplicationController)
);

/**
 * POST /api/applications/:applicationId/ai/interview-prep
 * Generate and persist interview preparation tips for a job application
 * - Protected route (requires authentication)
 * - Validates application ID parameter
 * - Returns 404 if application doesn't exist or user doesn't own it
 * - Requires jobDescription field in the application
 */
router.post(
  '/:applicationId/ai/interview-prep',
  validate(jobApplicationIdParamSchema),
  jobApplicationController.generateInterviewPrep.bind(jobApplicationController)
);

/**
 * POST /api/applications/:applicationId/ai/resume-improvement
 * Generate and persist resume improvement suggestions for a job application
 * - Protected route (requires authentication)
 * - Validates application ID parameter and request body (resumeBullets)
 * - Returns 404 if application doesn't exist or user doesn't own it
 * - Requires jobDescription field in the application
 */
router.post(
  '/:applicationId/ai/resume-improvement',
  validate(jobApplicationIdParamSchema),
  validate(resumeImprovementBodySchema),
  jobApplicationController.generateResumeImprovement.bind(jobApplicationController)
);

export default router;

