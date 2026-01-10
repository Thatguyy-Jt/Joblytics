import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Analytics Routes
 * 
 * Why: Defines HTTP endpoints for analytics operations.
 * All routes are protected with authentication middleware to ensure
 * only authenticated users can access their own analytics.
 * 
 * Responsibilities:
 * - Define route paths and HTTP methods
 * - Apply authentication middleware (all routes protected)
 * - Wire routes to controller methods
 * 
 * Analytics Scope:
 * - All routes require authentication (authenticate middleware)
 * - userId is extracted from req.user (set by authenticate middleware)
 * - Service layer scopes all analytics to authenticated user
 * - Users can only see their own analytics
 */
const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/analytics
 * Get comprehensive analytics (all metrics in one response)
 * - Protected route (requires authentication)
 * - Returns total, status distribution, monthly trends, success rate
 */
router.get(
  '/',
  analyticsController.getComprehensive.bind(analyticsController)
);

/**
 * GET /api/analytics/status-distribution
 * Get status distribution with counts and percentages
 * - Protected route (requires authentication)
 * - Returns counts and percentages for each status
 */
router.get(
  '/status-distribution',
  analyticsController.getStatusDistribution.bind(analyticsController)
);

/**
 * GET /api/analytics/monthly-trends
 * Get monthly application trends
 * - Protected route (requires authentication)
 * - Returns application count grouped by year-month
 */
router.get(
  '/monthly-trends',
  analyticsController.getMonthlyTrends.bind(analyticsController)
);

/**
 * GET /api/analytics/success-rate
 * Get success rate analytics
 * - Protected route (requires authentication)
 * - Success = applications that reached interview or offer stage
 * - Returns total, successful count, and success rate percentage
 */
router.get(
  '/success-rate',
  analyticsController.getSuccessRate.bind(analyticsController)
);

/**
 * GET /api/analytics/timeline
 * Get timeline analytics (monthly trends + status distribution)
 * - Protected route (requires authentication)
 * - Returns combined timeline data
 */
router.get(
  '/timeline',
  analyticsController.getTimeline.bind(analyticsController)
);

export default router;

