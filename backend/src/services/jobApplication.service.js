import jobApplicationRepository from '../repositories/jobApplication.repository.js';
import { APPLICATION_STATUS } from '../models/jobApplication.constants.js';
import aiService from './ai.service.js';
import EmailService from '../emails/index.js';
import userRepository from '../repositories/user.repository.js';
import reminderService from './reminder.service.js';

/**
 * Job Application Service
 * 
 * Why: Contains business logic and orchestrates operations for job applications.
 * This layer enforces ownership rules - users can only access/modify their own applications.
 * It sits between controllers (HTTP layer) and repositories (data layer).
 * 
 * Responsibilities:
 * - Enforce ownership checks (user can only access their own applications)
 * - Validate business rules (status transitions, required fields)
 * - Transform data between API format and database format
 * - Handle complex operations that require multiple repository calls
 * - Throw business-specific errors (not database errors)
 * 
 * Ownership Enforcement:
 * - All repository methods that modify/delete require userId
 * - Repository queries filter by userId automatically
 * - Service methods receive userId from authenticated user (req.user)
 * - If user tries to access another user's application, repository returns null
 * - Service throws 404 error (not 403) to prevent information leakage
 */
class JobApplicationService {
  /**
   * Create a new job application
   * @param {string} userId - Authenticated user's ID
   * @param {Object} applicationData - Application data
   */
  async createApplication(userId, applicationData) {
    // Automatically associate application with authenticated user
    const application = await jobApplicationRepository.create({
      ...applicationData,
      user: userId,
      company: applicationData.company.trim(),
      jobTitle: applicationData.jobTitle.trim(),
      jobLink: applicationData.jobLink?.trim() || '',
      source: applicationData.source?.trim() || '',
      notes: applicationData.notes?.trim() || '',
    });

    return application;
  }

  /**
   * Get application by ID (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Application ID
   */
  async getApplicationById(userId, applicationId) {
    // Repository method ensures user owns the application
    const application = await jobApplicationRepository.findByIdAndUserId(
      applicationId,
      userId
    );

    if (!application) {
      const error = new Error('Job application not found');
      error.statusCode = 404;
      throw error;
    }

    return application;
  }

  /**
   * Get all applications for a user (with pagination and filtering)
   * @param {string} userId - Authenticated user's ID
   * @param {Object} options - Query options (status, page, limit, sortBy, sortOrder)
   */
  async getUserApplications(userId, options = {}) {
    // Repository automatically filters by userId
    return await jobApplicationRepository.findByUserId(userId, options);
  }

  /**
   * Update application (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Application ID
   * @param {Object} updateData - Data to update
   */
  async updateApplication(userId, applicationId, updateData) {
    // Get current application to check status change
    const currentApplication = await jobApplicationRepository.findByIdAndUserId(
      applicationId,
      userId
    );

    if (!currentApplication) {
      const error = new Error('Job application not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = currentApplication.status;

    // Validate status transition if status is being updated
    if (updateData.status) {
      this.validateStatusTransition(updateData.status);
    }

    // Prepare update data (trim strings)
    const preparedData = { ...updateData };
    if (preparedData.company) preparedData.company = preparedData.company.trim();
    if (preparedData.jobTitle) preparedData.jobTitle = preparedData.jobTitle.trim();
    if (preparedData.jobLink) preparedData.jobLink = preparedData.jobLink.trim();
    if (preparedData.jobDescription !== undefined) preparedData.jobDescription = preparedData.jobDescription.trim();
    if (preparedData.source) preparedData.source = preparedData.source.trim();
    if (preparedData.notes) preparedData.notes = preparedData.notes.trim();

    // Repository method ensures user owns the application
    const updatedApplication = await jobApplicationRepository.updateByIdAndUserId(
      applicationId,
      userId,
      preparedData
    );

    if (!updatedApplication) {
      const error = new Error('Job application not found');
      error.statusCode = 404;
      throw error;
    }

    // Auto-create reminders if status changed (non-blocking)
    const newStatus = updatedApplication.status;
    if (oldStatus !== newStatus) {
      reminderService.autoCreateReminders(
        userId,
        updatedApplication,
        oldStatus,
        newStatus
      ).catch((error) => {
        console.error('Error auto-creating reminders:', error.message);
        // Don't throw - reminder creation shouldn't break status update
      });
    }

    return updatedApplication;
  }

  /**
   * Delete application (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Application ID
   */
  async deleteApplication(userId, applicationId) {
    // Repository method ensures user owns the application
    const deletedApplication = await jobApplicationRepository.deleteByIdAndUserId(
      applicationId,
      userId
    );

    if (!deletedApplication) {
      const error = new Error('Job application not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete all reminders associated with this application (non-blocking)
    const reminderRepository = (await import('../repositories/reminder.repository.js')).default;
    reminderRepository.deleteByApplicationId(applicationId).catch((error) => {
      console.error('Error deleting reminders for application:', error.message);
      // Don't throw - reminder deletion shouldn't break application deletion
    });

    return deletedApplication;
  }

  /**
   * Get application statistics for a user
   * @param {string} userId - Authenticated user's ID
   */
  async getStatistics(userId) {
    // Repository automatically filters by userId
    const stats = await jobApplicationRepository.getStatisticsByUserId(userId);
    const total = await jobApplicationRepository.countByUserId(userId);

    return {
      total,
      byStatus: {
        saved: stats[APPLICATION_STATUS.SAVED] || 0,
        applied: stats[APPLICATION_STATUS.APPLIED] || 0,
        interview: stats[APPLICATION_STATUS.INTERVIEW] || 0,
        offer: stats[APPLICATION_STATUS.OFFER] || 0,
        rejected: stats[APPLICATION_STATUS.REJECTED] || 0,
      },
    };
  }

  /**
   * Validate status value (business rule)
   * @param {string} status - Status to validate
   */
  validateStatusTransition(status) {
    if (!Object.values(APPLICATION_STATUS).includes(status)) {
      const error = new Error(`Invalid status: ${status}`);
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Generate and persist resume match analysis for a job application
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Job application ID
   * @returns {Object} Updated application with AI insights
   */
  async generateResumeMatch(userId, applicationId) {
    // Verify ownership and get application
    const application = await this.getApplicationById(userId, applicationId);

    // Validate required fields for AI analysis
    if (!application.jobDescription || application.jobDescription.trim() === '') {
      const error = new Error('Job description is required for resume match analysis. Please update the job application with a job description.');
      error.statusCode = 400;
      throw error;
    }

    // Call AI service to analyze resume match
    const aiResult = await aiService.analyzeResumeMatch(userId, {
      jobDescription: application.jobDescription,
      jobTitle: application.jobTitle,
      company: application.company,
    });

    // Update application with AI insights (preserve existing insights)
    const existingInsights = application.aiInsights || {};
    const updatedApplication = await jobApplicationRepository.updateAIInsights(
      applicationId,
      userId,
      {
        ...existingInsights,
        resumeMatch: {
          matchScore: aiResult.matchScore,
          strengths: aiResult.strengths,
          gaps: aiResult.gaps,
          suggestions: aiResult.suggestions,
          summary: aiResult.summary,
          analyzedAt: new Date(aiResult.analyzedAt),
        },
      }
    );

    if (!updatedApplication) {
      const error = new Error('Failed to update application with AI insights');
      error.statusCode = 500;
      throw error;
    }

    // Send notification email (non-blocking)
    userRepository.findById(userId).then((user) => {
      if (user) {
        EmailService.sendAIReportReadyEmail(user, 'resume-match', applicationId).catch((error) => {
          console.error('Failed to send AI report email:', error.message);
        });
      }
    }).catch(() => {
      // Ignore errors - email is optional
    });

    return updatedApplication;
  }

  /**
   * Generate and persist interview preparation tips for a job application
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Job application ID
   * @returns {Object} Updated application with AI insights
   */
  async generateInterviewPrep(userId, applicationId) {
    // Verify ownership and get application
    const application = await this.getApplicationById(userId, applicationId);

    // Validate required fields for AI analysis
    if (!application.jobDescription || application.jobDescription.trim() === '') {
      const error = new Error('Job description is required for interview preparation. Please update the job application with a job description.');
      error.statusCode = 400;
      throw error;
    }

    // Call AI service to generate interview prep tips
    const aiResult = await aiService.getInterviewPrepTips(userId, {
      jobDescription: application.jobDescription,
      jobTitle: application.jobTitle,
      company: application.company,
    });

    // Update application with AI insights (preserve existing insights)
    const existingInsights = application.aiInsights || {};
    const updatedApplication = await jobApplicationRepository.updateAIInsights(
      applicationId,
      userId,
      {
        ...existingInsights,
        interviewPrep: {
          likelyQuestions: aiResult.likelyQuestions,
          technicalTopics: aiResult.technicalTopics,
          talkingPoints: aiResult.talkingPoints,
          preparationSteps: aiResult.preparationSteps,
          questionsToAsk: aiResult.questionsToAsk,
          summary: aiResult.summary,
          generatedAt: new Date(aiResult.generatedAt),
        },
      }
    );

    if (!updatedApplication) {
      const error = new Error('Failed to update application with AI insights');
      error.statusCode = 500;
      throw error;
    }

    // Send notification email (non-blocking)
    userRepository.findById(userId).then((user) => {
      if (user) {
        EmailService.sendAIReportReadyEmail(user, 'interview-prep', applicationId).catch((error) => {
          console.error('Failed to send AI report email:', error.message);
        });
      }
    }).catch(() => {
      // Ignore errors - email is optional
    });

    return updatedApplication;
  }

  /**
   * Generate and persist resume improvement suggestions for a job application
   * @param {string} userId - Authenticated user's ID
   * @param {string} applicationId - Job application ID
   * @param {Array<string>} resumeBullets - Resume bullets to improve
   * @returns {Object} Updated application with AI insights
   */
  async generateResumeImprovement(userId, applicationId, resumeBullets) {
    // Verify ownership and get application
    const application = await this.getApplicationById(userId, applicationId);

    // Validate required fields for AI analysis
    if (!application.jobDescription || application.jobDescription.trim() === '') {
      const error = new Error('Job description is required for resume improvement. Please update the job application with a job description.');
      error.statusCode = 400;
      throw error;
    }

    // Validate resume bullets
    if (!resumeBullets || !Array.isArray(resumeBullets) || resumeBullets.length === 0) {
      const error = new Error('Resume bullets are required and must be a non-empty array');
      error.statusCode = 400;
      throw error;
    }

    // Call AI service to generate resume improvements
    const aiResult = await aiService.getResumeImprovements(userId, {
      resumeBullets,
      jobDescription: application.jobDescription,
      jobTitle: application.jobTitle,
    });

    // Update application with AI insights (preserve existing insights)
    const existingInsights = application.aiInsights || {};
    const updatedApplication = await jobApplicationRepository.updateAIInsights(
      applicationId,
      userId,
      {
        ...existingInsights,
        resumeImprovement: {
          improvedBullets: aiResult.improvedBullets,
          improvements: aiResult.improvements,
          keywords: aiResult.keywords,
          summary: aiResult.summary,
          generatedAt: new Date(aiResult.generatedAt),
        },
      }
    );

    if (!updatedApplication) {
      const error = new Error('Failed to update application with AI insights');
      error.statusCode = 500;
      throw error;
    }

    // Send notification email (non-blocking)
    userRepository.findById(userId).then((user) => {
      if (user) {
        EmailService.sendAIReportReadyEmail(user, 'resume-improvement', applicationId).catch((error) => {
          console.error('Failed to send AI report email:', error.message);
        });
      }
    }).catch(() => {
      // Ignore errors - email is optional
    });

    return updatedApplication;
  }
}

export default new JobApplicationService();

