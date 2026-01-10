import reminderService from '../services/reminder.service.js';

/**
 * Reminder Controller
 * 
 * Why: Handles HTTP requests and responses for reminder operations.
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
 * - If user tries to access another user's reminder, service returns 404
 * - This prevents information leakage (user doesn't know if reminder exists)
 */
class ReminderController {
  /**
   * Create a new reminder
   * POST /api/reminders
   */
  async create(req, res) {
    try {
      const userId = req.user._id.toString();
      const reminderData = req.body;

      const reminder = await reminderService.createReminder(userId, reminderData);

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: { reminder },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create reminder',
      });
    }
  }

  /**
   * Get reminder by ID
   * GET /api/reminders/:id
   */
  async getById(req, res) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      const reminder = await reminderService.getReminderById(userId, id);

      res.status(200).json({
        success: true,
        data: { reminder },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get reminder',
      });
    }
  }

  /**
   * Get all reminders for authenticated user
   * GET /api/reminders
   */
  async getAll(req, res) {
    try {
      const userId = req.user._id.toString();
      const { page, limit, applicationId, reminderType, sent, startDate, endDate, sortBy, sortOrder } = req.query;

      const result = await reminderService.getUserReminders(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        applicationId,
        reminderType,
        sent,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: {
          reminders: result.reminders,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get reminders',
      });
    }
  }

  /**
   * Update reminder
   * PUT /api/reminders/:id
   */
  async update(req, res) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;
      const updateData = req.body;

      const reminder = await reminderService.updateReminder(userId, id, updateData);

      res.status(200).json({
        success: true,
        message: 'Reminder updated successfully',
        data: { reminder },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update reminder',
      });
    }
  }

  /**
   * Delete reminder
   * DELETE /api/reminders/:id
   */
  async delete(req, res) {
    try {
      const userId = req.user._id.toString();
      const { id } = req.params;

      await reminderService.deleteReminder(userId, id);

      res.status(200).json({
        success: true,
        message: 'Reminder deleted successfully',
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete reminder',
      });
    }
  }
}

export default new ReminderController();

