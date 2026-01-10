import analyticsService from '../services/analytics.service.js';

/**
 * Analytics Controller
 * 
 * Why: Handles HTTP requests and responses for analytics operations.
 * Controllers are thin - they only handle HTTP concerns (extract data, format responses).
 * All analytics logic is handled in the analytics service.
 * 
 * Responsibilities:
 * - Extract userId from req.user (set by auth middleware)
 * - Call analytics service for calculations
 * - Format and send HTTP responses
 * - Handle HTTP-specific errors
 * 
 * Analytics Scope:
 * - userId comes from req.user (set by authenticate middleware)
 * - Service methods receive userId and scope all analytics to that user
 * - Users can only see their own analytics
 */
class AnalyticsController {
  /**
   * Get comprehensive analytics
   * GET /api/analytics
   */
  async getComprehensive(req, res) {
    try {
      const userId = req.user._id.toString();

      const analytics = await analyticsService.getComprehensiveAnalytics(userId);

      res.status(200).json({
        success: true,
        data: { analytics },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get analytics',
      });
    }
  }

  /**
   * Get status distribution
   * GET /api/analytics/status-distribution
   */
  async getStatusDistribution(req, res) {
    try {
      const userId = req.user._id.toString();

      const distribution = await analyticsService.getStatusDistribution(userId);

      res.status(200).json({
        success: true,
        data: { distribution },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get status distribution',
      });
    }
  }

  /**
   * Get monthly trends
   * GET /api/analytics/monthly-trends
   */
  async getMonthlyTrends(req, res) {
    try {
      const userId = req.user._id.toString();

      const trends = await analyticsService.getMonthlyTrends(userId);

      res.status(200).json({
        success: true,
        data: { trends },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get monthly trends',
      });
    }
  }

  /**
   * Get success rate
   * GET /api/analytics/success-rate
   */
  async getSuccessRate(req, res) {
    try {
      const userId = req.user._id.toString();

      const successRate = await analyticsService.getSuccessRate(userId);

      res.status(200).json({
        success: true,
        data: { successRate },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get success rate',
      });
    }
  }

  /**
   * Get timeline analytics
   * GET /api/analytics/timeline
   */
  async getTimeline(req, res) {
    try {
      const userId = req.user._id.toString();

      const timeline = await analyticsService.getTimelineAnalytics(userId);

      res.status(200).json({
        success: true,
        data: { timeline },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get timeline analytics',
      });
    }
  }
}

export default new AnalyticsController();

