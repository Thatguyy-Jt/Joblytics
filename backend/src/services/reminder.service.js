import reminderRepository from '../repositories/reminder.repository.js';
import jobApplicationRepository from '../repositories/jobApplication.repository.js';
import { REMINDER_TYPE } from '../models/reminder.constants.js';
import { APPLICATION_STATUS } from '../models/jobApplication.constants.js';

/**
 * Reminder Service
 * 
 * Why: Contains business logic and orchestrates operations for reminders.
 * This layer enforces ownership rules and handles auto-creation of reminders
 * based on job application status changes.
 * 
 * Responsibilities:
 * - Enforce ownership checks (user can only access their own reminders)
 * - Auto-create reminders when application status changes
 * - Calculate reminder dates based on application dates
 * - Validate business rules (dates, reminder types)
 * - Handle complex operations that require multiple repository calls
 * 
 * Ownership Enforcement:
 * - All repository methods that modify/delete require userId
 * - Repository queries filter by userId automatically
 * - Service methods receive userId from authenticated user (req.user)
 * - If user tries to access another user's reminder, repository returns null
 * - Service throws 404 error (not 403) to prevent information leakage
 */
class ReminderService {
  /**
   * Create a new reminder
   * @param {string} userId - Authenticated user's ID
   * @param {Object} reminderData - Reminder data
   * @returns {Object} Created reminder
   */
  async createReminder(userId, reminderData) {
    const { applicationId, reminderDate, reminderType, notes } = reminderData;

    // Verify application exists and belongs to user
    const application = await jobApplicationRepository.findByIdAndUserId(
      applicationId,
      userId
    );

    if (!application) {
      const error = new Error('Job application not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate reminder date is in the future
    const reminderDateObj = new Date(reminderDate);
    if (reminderDateObj <= new Date()) {
      const error = new Error('Reminder date must be in the future');
      error.statusCode = 400;
      throw error;
    }

    // Create reminder
    const reminder = await reminderRepository.create({
      user: userId,
      application: applicationId,
      reminderDate: reminderDateObj,
      reminderType: reminderType || REMINDER_TYPE.FOLLOW_UP,
      notes: notes?.trim() || '',
    });

    return reminder;
  }

  /**
   * Get reminder by ID (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} reminderId - Reminder ID
   * @returns {Object} Reminder
   */
  async getReminderById(userId, reminderId) {
    const reminder = await reminderRepository.findByIdAndUserId(reminderId, userId);

    if (!reminder) {
      const error = new Error('Reminder not found');
      error.statusCode = 404;
      throw error;
    }

    return reminder;
  }

  /**
   * Get all reminders for a user (with pagination and filtering)
   * @param {string} userId - Authenticated user's ID
   * @param {Object} options - Query options
   * @returns {Object} Reminders with pagination
   */
  async getUserReminders(userId, options = {}) {
    // Repository automatically filters by userId
    return await reminderRepository.findByUserId(userId, options);
  }

  /**
   * Update reminder (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} reminderId - Reminder ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated reminder
   */
  async updateReminder(userId, reminderId, updateData) {
    // Prepare update data
    const preparedData = { ...updateData };

    // Validate reminder date if being updated
    if (preparedData.reminderDate) {
      const reminderDateObj = new Date(preparedData.reminderDate);
      if (reminderDateObj <= new Date()) {
        const error = new Error('Reminder date must be in the future');
        error.statusCode = 400;
        throw error;
      }
      preparedData.reminderDate = reminderDateObj;
    }

    if (preparedData.notes !== undefined) {
      preparedData.notes = preparedData.notes.trim();
    }

    // Repository method ensures user owns the reminder
    const updatedReminder = await reminderRepository.updateByIdAndUserId(
      reminderId,
      userId,
      preparedData
    );

    if (!updatedReminder) {
      const error = new Error('Reminder not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedReminder;
  }

  /**
   * Delete reminder (with ownership check)
   * @param {string} userId - Authenticated user's ID
   * @param {string} reminderId - Reminder ID
   * @returns {Object} Deleted reminder
   */
  async deleteReminder(userId, reminderId) {
    // Repository method ensures user owns the reminder
    const deletedReminder = await reminderRepository.deleteByIdAndUserId(
      reminderId,
      userId
    );

    if (!deletedReminder) {
      const error = new Error('Reminder not found');
      error.statusCode = 404;
      throw error;
    }

    return deletedReminder;
  }

  /**
   * Auto-create reminder when application status changes
   * This is called from JobApplicationService when status changes
   * @param {string} userId - User ID
   * @param {Object} application - Job application object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  async autoCreateReminders(userId, application, oldStatus, newStatus) {
    // Only create reminders if status actually changed
    if (oldStatus === newStatus) {
      return;
    }

    try {
      // When status changes to INTERVIEW, create interview reminder 1 day before
      if (newStatus === APPLICATION_STATUS.INTERVIEW && application.dateApplied) {
        const interviewDate = new Date(application.dateApplied);
        const reminderDate = new Date(interviewDate);
        reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before interview

        // Only create if reminder date is in the future
        if (reminderDate > new Date()) {
          await reminderRepository.create({
            user: userId,
            application: application._id,
            reminderDate,
            reminderType: REMINDER_TYPE.INTERVIEW,
            notes: `Auto-created reminder for interview at ${application.company}`,
          });
        }
      }

      // When status changes to APPLIED, create follow-up reminder 7 days later
      if (newStatus === APPLICATION_STATUS.APPLIED && oldStatus !== APPLICATION_STATUS.APPLIED) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + 7); // 7 days from now

        await reminderRepository.create({
          user: userId,
          application: application._id,
          reminderDate,
          reminderType: REMINDER_TYPE.FOLLOW_UP,
          notes: `Auto-created follow-up reminder for application at ${application.company}`,
        });
      }
    } catch (error) {
      // Log error but don't throw - reminder creation shouldn't break status update
      console.error('Error auto-creating reminders:', error.message);
    }
  }

  /**
   * Get due reminders for processing (used by job scheduler)
   * @returns {Array} Array of due reminders
   */
  async getDueReminders() {
    return await reminderRepository.findDueReminders();
  }

  /**
   * Mark reminder as sent (used by job scheduler)
   * @param {string} reminderId - Reminder ID
   * @returns {Object} Updated reminder
   */
  async markReminderAsSent(reminderId) {
    return await reminderRepository.markAsSent(reminderId);
  }
}

export default new ReminderService();

