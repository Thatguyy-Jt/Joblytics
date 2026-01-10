import User from '../models/User.js';

/**
 * User Repository
 * 
 * Why: Encapsulates all database operations for the User model.
 * This layer separates data access logic from business logic, making:
 * - Code more testable (can mock repository easily)
 * - Database queries reusable across services
 * - Database changes isolated (change MongoDB to PostgreSQL? Only update repository)
 * - Complex queries centralized (pagination, filtering, sorting)
 * 
 * Responsibilities:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Complex queries (find by criteria, pagination, filtering)
 * - Data transformation between service layer and database
 * - Query optimization (select specific fields, use indexes)
 */
class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email) {
    return await User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token) {
    return await User.findOne({ passwordResetToken: token }).select('+passwordResetToken +passwordResetTokenExpires');
  }

  /**
   * Find user by ID with password
   */
  async findByIdWithPassword(userId) {
    return await User.findById(userId).select('+password');
  }

  /**
   * Update user by ID
   */
  async updateById(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete user by ID
   */
  async deleteById(userId) {
    return await User.findByIdAndDelete(userId);
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll({ page = 1, limit = 10, status, role } = {}) {
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new UserRepository();

