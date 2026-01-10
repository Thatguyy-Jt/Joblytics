import jobApplicationService from '../services/jobApplication.service.js';

/**
 * Job Application Controller
 * 
 * Why: Handles HTTP requests and responses for job application operations.
 * Controllers are thin - they only handle HTTP concerns (extract data, format responses).
 * All business logic and ownership checks are handled in the service layer.
 * 
 * Responsibilities:
 * - Extract data from HTTP requests (body, params, query)
 * - Extract userId from req.user (set by auth middleware)
 * - Call service layer for business logic
 * - Format and send HTTP responses
 * - Handle HTTP-specific errors
 * 
 * Ownership Enforcement:
 * - userId comes from req.user (set by authenticate middleware)
 * - Service methods receive userId and enforce ownership
 * - If user tries to access another user's application, service returns 404
 * - This prevents information leakage (user doesn't know if application exists)
 */
class JobApplicationController {
  /**
   * Create a new job application
   * POST /api/applications
   */
  async create(req, res) {
    try {
      // Extract userId from authenticated user (set by auth middleware)
      const userId = req.user._id.toString();
      const applicationData = req.body;

      // Call service to create application (automatically associates with user)
      const application = await jobApplicationService.createApplication(
        userId,
        applicationData
      );

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: { application },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create job application',
      });
    }
  }

  /**
   * Get application by ID
   * GET /api/applications/:applicationId
   */
  async getById(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;

      // Service enforces ownership - returns 404 if user doesn't own application
      const application = await jobApplicationService.getApplicationById(
        userId,
        applicationId
      );

      res.status(200).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get job application',
      });
    }
  }

  /**
   * Get all applications for authenticated user
   * GET /api/applications
   */
  async getAll(req, res) {
    try {
      const userId = req.user._id.toString();
      const { page, limit, status, sortBy, sortOrder } = req.query;

      // Service automatically filters by userId
      const result = await jobApplicationService.getUserApplications(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: {
          applications: result.applications,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get job applications',
      });
    }
  }

  /**
   * Update application
   * PUT /api/applications/:applicationId
   */
  async update(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;
      const updateData = req.body;

      // Service enforces ownership - returns 404 if user doesn't own application
      const application = await jobApplicationService.updateApplication(
        userId,
        applicationId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: 'Job application updated successfully',
        data: { application },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update job application',
      });
    }
  }

  /**
   * Delete application
   * DELETE /api/applications/:applicationId
   */
  async delete(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;

      // Service enforces ownership - returns 404 if user doesn't own application
      await jobApplicationService.deleteApplication(userId, applicationId);

      res.status(200).json({
        success: true,
        message: 'Job application deleted successfully',
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete job application',
      });
    }
  }

  /**
   * Get application statistics
   * GET /api/applications/statistics
   */
  async getStatistics(req, res) {
    try {
      const userId = req.user._id.toString();

      // Service automatically filters by userId
      const statistics = await jobApplicationService.getStatistics(userId);

      res.status(200).json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get statistics',
      });
    }
  }

  /**
   * Generate and persist resume match analysis for a job application
   * POST /api/applications/:applicationId/ai/resume-match
   */
  async generateResumeMatch(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;

      const application = await jobApplicationService.generateResumeMatch(
        userId,
        applicationId
      );

      res.status(200).json({
        success: true,
        message: 'Resume match analysis generated successfully',
        data: {
          application,
          analysis: application.aiInsights.resumeMatch,
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate resume match analysis',
      });
    }
  }

  /**
   * Generate and persist interview preparation tips for a job application
   * POST /api/applications/:applicationId/ai/interview-prep
   */
  async generateInterviewPrep(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;

      const application = await jobApplicationService.generateInterviewPrep(
        userId,
        applicationId
      );

      res.status(200).json({
        success: true,
        message: 'Interview preparation tips generated successfully',
        data: {
          application,
          tips: application.aiInsights.interviewPrep,
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate interview preparation tips',
      });
    }
  }

  /**
   * Generate and persist resume improvement suggestions for a job application
   * POST /api/applications/:applicationId/ai/resume-improvement
   */
  async generateResumeImprovement(req, res) {
    try {
      const userId = req.user._id.toString();
      const { applicationId } = req.params;
      const { resumeBullets } = req.body;

      const application = await jobApplicationService.generateResumeImprovement(
        userId,
        applicationId,
        resumeBullets
      );

      res.status(200).json({
        success: true,
        message: 'Resume improvement suggestions generated successfully',
        data: {
          application,
          improvements: application.aiInsights.resumeImprovement,
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate resume improvement suggestions',
      });
    }
  }
}

export default new JobApplicationController();

