import jobApplicationRepository from '../repositories/jobApplication.repository.js';
import { APPLICATION_STATUS } from '../models/jobApplication.constants.js';

/**
 * Analytics Service
 * 
 * Why: Handles analytics business logic separate from HTTP concerns.
 * This service orchestrates analytics calculations and data aggregation.
 * Analytics logic lives here, not in controllers or repositories.
 * 
 * Responsibilities:
 * - Calculate analytics metrics (success rate, trends, etc.)
 * - Format analytics data for API responses
 * - Handle analytics-specific business rules
 * - Ensure all analytics are scoped to authenticated user
 * 
 * Analytics Scope:
 * - All analytics are scoped to the authenticated user (userId)
 * - Repository methods filter by userId automatically
 * - Service receives userId from controllers (set by auth middleware)
 */
class AnalyticsService {
  /**
   * Get comprehensive analytics for a user
   * @param {string} userId - Authenticated user's ID
   * @returns {Object} Comprehensive analytics data
   */
  async getComprehensiveAnalytics(userId) {
    const analytics = await jobApplicationRepository.getComprehensiveAnalyticsByUserId(
      userId
    );

    // Format status counts with all possible statuses (even if 0)
    const formattedStatusCounts = {
      saved: analytics.byStatus[APPLICATION_STATUS.SAVED] || 0,
      applied: analytics.byStatus[APPLICATION_STATUS.APPLIED] || 0,
      interview: analytics.byStatus[APPLICATION_STATUS.INTERVIEW] || 0,
      offer: analytics.byStatus[APPLICATION_STATUS.OFFER] || 0,
      rejected: analytics.byStatus[APPLICATION_STATUS.REJECTED] || 0,
    };

    return {
      total: analytics.total,
      byStatus: formattedStatusCounts,
      monthlyTrends: analytics.monthlyTrends,
      successRate: Math.round(analytics.successRate * 100) / 100, // Round to 2 decimal places
      successful: analytics.successful,
    };
  }

  /**
   * Get status distribution analytics
   * @param {string} userId - Authenticated user's ID
   * @returns {Object} Status counts
   */
  async getStatusDistribution(userId) {
    const stats = await jobApplicationRepository.getStatisticsByUserId(userId);
    const total = await jobApplicationRepository.countByUserId(userId);

    const formatted = {
      saved: stats[APPLICATION_STATUS.SAVED] || 0,
      applied: stats[APPLICATION_STATUS.APPLIED] || 0,
      interview: stats[APPLICATION_STATUS.INTERVIEW] || 0,
      offer: stats[APPLICATION_STATUS.OFFER] || 0,
      rejected: stats[APPLICATION_STATUS.REJECTED] || 0,
    };

    // Calculate percentages
    const percentages = {};
    Object.keys(formatted).forEach((status) => {
      percentages[status] =
        total > 0 ? Math.round((formatted[status] / total) * 100 * 100) / 100 : 0;
    });

    return {
      total,
      counts: formatted,
      percentages,
    };
  }

  /**
   * Get monthly application trends
   * @param {string} userId - Authenticated user's ID
   * @returns {Array} Monthly trends data
   */
  async getMonthlyTrends(userId) {
    return await jobApplicationRepository.getMonthlyTrendsByUserId(userId);
  }

  /**
   * Get success rate analytics
   * Success = applications that reached interview or offer stage
   * @param {string} userId - Authenticated user's ID
   * @returns {Object} Success rate data
   */
  async getSuccessRate(userId) {
    const successData = await jobApplicationRepository.getSuccessRateByUserId(
      userId
    );

    return {
      total: successData.total,
      successful: successData.successful,
      successRate: Math.round(successData.successRate * 100) / 100, // Round to 2 decimal places
      // Calculate conversion rates
      appliedToInterviewRate:
        successData.total > 0
          ? Math.round(
              (successData.successful / successData.total) * 100 * 100
            ) / 100
          : 0,
    };
  }

  /**
   * Get application timeline analytics
   * Shows applications over time with status breakdown
   * @param {string} userId - Authenticated user's ID
   * @returns {Object} Timeline analytics
   */
  async getTimelineAnalytics(userId) {
    const monthlyTrends = await this.getMonthlyTrends(userId);
    const statusDistribution = await this.getStatusDistribution(userId);

    return {
      monthlyTrends,
      statusDistribution,
    };
  }
}

export default new AnalyticsService();

