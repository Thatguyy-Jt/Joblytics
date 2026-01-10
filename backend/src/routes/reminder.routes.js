import express from 'express';
import reminderController from '../controllers/reminder.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createReminderSchema,
  updateReminderSchema,
  reminderIdParamSchema,
  getRemindersQuerySchema,
} from '../validations/reminder.validation.js';

/**
 * Reminder Routes
 * 
 * Why: Defines HTTP endpoints for reminder operations.
 * All routes are protected with authentication middleware to ensure
 * only authenticated users can access their reminders.
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
 * - Service layer enforces ownership - users can only access their own reminders
 */
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/reminders
 * Create a new reminder
 * - Protected route (requires authentication)
 * - Validates request body
 * - Automatically associates reminder with authenticated user
 */
router.post(
  '/',
  validate(createReminderSchema),
  reminderController.create.bind(reminderController)
);

/**
 * GET /api/reminders
 * Get all reminders for authenticated user
 * - Protected route (requires authentication)
 * - Validates query parameters (pagination, filtering)
 * - Returns only reminders owned by authenticated user
 */
router.get(
  '/',
  validate(getRemindersQuerySchema),
  reminderController.getAll.bind(reminderController)
);

/**
 * GET /api/reminders/:id
 * Get reminder by ID
 * - Protected route (requires authentication)
 * - Validates reminder ID parameter
 * - Returns 404 if reminder doesn't exist or user doesn't own it
 */
router.get(
  '/:id',
  validate(reminderIdParamSchema),
  reminderController.getById.bind(reminderController)
);

/**
 * PUT /api/reminders/:id
 * Update reminder
 * - Protected route (requires authentication)
 * - Validates reminder ID parameter and request body
 * - Returns 404 if reminder doesn't exist or user doesn't own it
 */
router.put(
  '/:id',
  validate(reminderIdParamSchema),
  validate(updateReminderSchema),
  reminderController.update.bind(reminderController)
);

/**
 * DELETE /api/reminders/:id
 * Delete reminder
 * - Protected route (requires authentication)
 * - Validates reminder ID parameter
 * - Returns 404 if reminder doesn't exist or user doesn't own it
 */
router.delete(
  '/:id',
  validate(reminderIdParamSchema),
  reminderController.delete.bind(reminderController)
);

export default router;

