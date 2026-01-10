import mongoose from 'mongoose';
import JobApplication from '../models/JobApplication.js';
import { APPLICATION_STATUS } from '../models/jobApplication.constants.js';

/**
 * Job Application Repository
 * 
 * Why: Encapsulates all database operations for the JobApplication model.
 * This layer separates data access logic from business logic, making:
 * - Code more testable (can mock repository easily)
 * - Database queries reusable across services
 * - Database changes isolated
 * - Complex queries centralized (pagination, filtering, sorting)
 * 
 * Responsibilities:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Complex queries (find by criteria, pagination, filtering)
 * - Data transformation between service layer and database
 * - Query optimization (select specific fields, use indexes)
 */
class JobApplicationRepository {
  /**
   * Create a new job application
   */
  async create(applicationData) {
    const application = new JobApplication(applicationData);
    return await application.save();
  }

  /**
   * Find application by ID
   */
  async findById(applicationId) {
    return await JobApplication.findById(applicationId);
  }

  /**
   * Find application by ID and user ID (for ownership verification)
   */
  async findByIdAndUserId(applicationId, userId) {
    return await JobApplication.findOne({
      _id: applicationId,
      user: userId,
    });
  }

  /**
   * Find all applications for a specific user
   */
  async findByUserId(userId, options = {}) {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [applications, total] = await Promise.all([
      JobApplication.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance when not needing Mongoose documents
      JobApplication.countDocuments(query),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update application by ID and user ID (ensures ownership)
   */
  async updateByIdAndUserId(applicationId, userId, updateData) {
    return await JobApplication.findOneAndUpdate(
      {
        _id: applicationId,
        user: userId,
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete application by ID and user ID (ensures ownership)
   */
  async deleteByIdAndUserId(applicationId, userId) {
    return await JobApplication.findOneAndDelete({
      _id: applicationId,
      user: userId,
    });
  }

  /**
   * Get application statistics for a user
   */
  async getStatisticsByUserId(userId) {
    const stats = await JobApplication.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform to object format
    const statistics = {};
    stats.forEach((stat) => {
      statistics[stat._id] = stat.count;
    });

    return statistics;
  }

  /**
   * Count total applications for a user
   */
  async countByUserId(userId) {
    return await JobApplication.countDocuments({ user: userId });
  }

  /**
   * Update AI insights for a job application
   * @param {string} applicationId - Application ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {Object} aiInsights - AI insights data to update
   * @returns {Object|null} Updated application or null if not found
   */
  async updateAIInsights(applicationId, userId, aiInsights) {
    return await JobApplication.findOneAndUpdate(
      {
        _id: applicationId,
        user: userId, // Ensure ownership
      },
      {
        $set: {
          'aiInsights': aiInsights,
        },
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );
  }

  /**
   * Get monthly application trends for a user
   * Aggregation pipeline:
   * 1. $match: Filter by user ID
   * 2. $group: Group by year-month and count applications
   * 3. $sort: Sort by year-month ascending
   */
  async getMonthlyTrendsByUserId(userId) {
    const trends = await JobApplication.aggregate([
      // Stage 1: Match documents for this user
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      // Stage 2: Group by year-month and count
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      // Stage 3: Sort by year-month ascending
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      // Stage 4: Format output
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] } },
            ],
          },
        },
      },
    ]);

    return trends;
  }

  /**
   * Get success rate analytics for a user
   * Success = applications that reached interview or offer stage
   * Aggregation pipeline:
   * 1. $match: Filter by user ID
   * 2. $group: Count total and successful applications
   * 3. $project: Calculate success rate percentage
   */
  async getSuccessRateByUserId(userId) {
    const result = await JobApplication.aggregate([
      // Stage 1: Match documents for this user
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      // Stage 2: Group and count total vs successful
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      APPLICATION_STATUS.INTERVIEW,
                      APPLICATION_STATUS.OFFER,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // Stage 3: Calculate success rate
      {
        $project: {
          _id: 0,
          total: 1,
          successful: 1,
          successRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: ['$successful', '$total'],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    // If no applications, return default values
    if (result.length === 0) {
      return {
        total: 0,
        successful: 0,
        successRate: 0,
      };
    }

    return result[0];
  }

  /**
   * Get comprehensive analytics for a user
   * Combines multiple aggregations for efficiency
   */
  async getComprehensiveAnalyticsByUserId(userId) {
    const [
      statusCounts,
      monthlyTrends,
      successRate,
      totalCount,
    ] = await Promise.all([
      this.getStatisticsByUserId(userId),
      this.getMonthlyTrendsByUserId(userId),
      this.getSuccessRateByUserId(userId),
      this.countByUserId(userId),
    ]);

    return {
      total: totalCount,
      byStatus: statusCounts,
      monthlyTrends,
      successRate: successRate.successRate,
      successful: successRate.successful,
    };
  }
}

export default new JobApplicationRepository();

