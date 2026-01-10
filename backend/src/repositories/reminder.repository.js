import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';

/**
 * Reminder Repository
 * 
 * Why: Encapsulates all database operations for the Reminder model.
 * This layer separates data access logic from business logic, making:
 * - Code more testable (can mock repository easily)
 * - Database queries reusable across services
 * - Database changes isolated
 * - Complex queries centralized (pagination, filtering, sorting)
 * 
 * Responsibilities:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Complex queries (find by criteria, pagination, filtering)
 * - Query optimization (select specific fields, use indexes)
 * - Ownership enforcement (all queries filter by userId)
 */
class ReminderRepository {
  /**
   * Create a new reminder
   * @param {Object} reminderData - Reminder data
   * @returns {Object} Created reminder
   */
  async create(reminderData) {
    const reminder = new Reminder(reminderData);
    return await reminder.save();
  }

  /**
   * Find reminder by ID
   * @param {string} reminderId - Reminder ID
   * @returns {Object|null} Reminder or null
   */
  async findById(reminderId) {
    return await Reminder.findById(reminderId)
      .populate('application', 'company jobTitle status dateApplied')
      .populate('user', 'firstName lastName email');
  }

  /**
   * Find reminder by ID and user ID (for ownership verification)
   * @param {string} reminderId - Reminder ID
   * @param {string} userId - User ID
   * @returns {Object|null} Reminder or null
   */
  async findByIdAndUserId(reminderId, userId) {
    return await Reminder.findOne({
      _id: reminderId,
      user: userId,
    })
      .populate('application', 'company jobTitle status dateApplied')
      .populate('user', 'firstName lastName email');
  }

  /**
   * Find all reminders for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit, filters)
   * @returns {Object} Reminders with pagination
   */
  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      applicationId,
      reminderType,
      sent,
      startDate,
      endDate,
      sortBy = 'reminderDate',
      sortOrder = 'asc',
    } = options;

    // Build query filter
    const filter = { user: userId };

    if (applicationId) {
      filter.application = new mongoose.Types.ObjectId(applicationId);
    }

    if (reminderType) {
      filter.reminderType = reminderType;
    }

    if (sent !== undefined) {
      filter.sent = sent === true || sent === 'true';
    }

    if (startDate || endDate) {
      filter.reminderDate = {};
      if (startDate) {
        filter.reminderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.reminderDate.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [reminders, total] = await Promise.all([
      Reminder.find(filter)
        .populate('application', 'company jobTitle status dateApplied')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Reminder.countDocuments(filter),
    ]);

    return {
      reminders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update reminder by ID and user ID (ensures ownership)
   * @param {string} reminderId - Reminder ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object|null} Updated reminder or null
   */
  async updateByIdAndUserId(reminderId, userId, updateData) {
    return await Reminder.findOneAndUpdate(
      {
        _id: reminderId,
        user: userId,
      },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('application', 'company jobTitle status dateApplied')
      .populate('user', 'firstName lastName email');
  }

  /**
   * Delete reminder by ID and user ID (ensures ownership)
   * @param {string} reminderId - Reminder ID
   * @param {string} userId - User ID
   * @returns {Object|null} Deleted reminder or null
   */
  async deleteByIdAndUserId(reminderId, userId) {
    return await Reminder.findOneAndDelete({
      _id: reminderId,
      user: userId,
    });
  }

  /**
   * Find all due reminders (for job scheduler)
   * Due reminders: reminderDate <= now AND sent === false
   * @param {Date} now - Current date/time
   * @returns {Array} Array of due reminders
   */
  async findDueReminders(now = new Date()) {
    return await Reminder.find({
      reminderDate: { $lte: now },
      sent: false,
    })
      .populate('application', 'company jobTitle status dateApplied jobDescription')
      .populate('user', 'firstName lastName email')
      .lean();
  }

  /**
   * Mark reminder as sent
   * @param {string} reminderId - Reminder ID
   * @returns {Object|null} Updated reminder or null
   */
  async markAsSent(reminderId) {
    return await Reminder.findByIdAndUpdate(
      reminderId,
      {
        $set: {
          sent: true,
          sentAt: new Date(),
        },
      },
      { new: true }
    );
  }

  /**
   * Count reminders for a user by application
   * @param {string} userId - User ID
   * @param {string} applicationId - Application ID
   * @returns {number} Count of reminders
   */
  async countByApplicationId(userId, applicationId) {
    return await Reminder.countDocuments({
      user: userId,
      application: applicationId,
    });
  }

  /**
   * Delete all reminders for an application (when application is deleted)
   * @param {string} applicationId - Application ID
   * @returns {Object} Delete result
   */
  async deleteByApplicationId(applicationId) {
    return await Reminder.deleteMany({
      application: applicationId,
    });
  }
}

export default new ReminderRepository();

