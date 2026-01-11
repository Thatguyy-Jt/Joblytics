import userRepository from '../repositories/user.repository.js';
import { USER_STATUS } from '../models/user.constants.js';

/**
 * User Service
 * 
 * Why: Contains business logic and orchestrates operations.
 * This layer sits between controllers (HTTP layer) and repositories (data layer).
 * It handles:
 * - Business rules and validation logic
 * - Data transformation and enrichment
 * - Orchestrating multiple repository calls
 * - Error handling specific to business logic
 * - Future: integration with external services (email, AI, etc.)
 * 
 * Responsibilities:
 * - Validate business rules (e.g., email uniqueness, password strength)
 * - Transform data between API format and database format
 * - Handle complex operations that require multiple repository calls
 * - Throw business-specific errors (not database errors)
 * - Prepare data for responses
 */
class UserService {
  /**
   * Create a new user
   * Business logic: Check email uniqueness, validate data
   */
  async createUser(userData) {
    // Check if email already exists
    const emailExists = await userRepository.emailExists(userData.email);
    
    if (emailExists) {
      const error = new Error('Email already exists');
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Create user
    const user = await userRepository.create({
      ...userData,
      email: userData.email.toLowerCase().trim(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Update user
   * Business logic: Prevent email conflicts, validate updates
   */
  async updateUser(userId, updateData) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.emailExists(updateData.email);
      if (emailExists) {
        const error = new Error('Email already exists');
        error.statusCode = 409;
        throw error;
      }
      updateData.email = updateData.email.toLowerCase().trim();
    }

    // Trim string fields and remove empty strings
    if (updateData.firstName !== undefined) {
      updateData.firstName = updateData.firstName.trim();
      if (updateData.firstName === '') delete updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      updateData.lastName = updateData.lastName.trim();
      if (updateData.lastName === '') delete updateData.lastName;
    }

    // Handle nested profile object - merge with existing profile
    if (updateData.profile) {
      const existingUser = await userRepository.findById(userId);
      const existingProfile = existingUser?.profile || {};
      updateData.profile = {
        ...existingProfile,
        ...updateData.profile,
      };
    }

    const updatedUser = await userRepository.updateById(userId, updateData);
    return updatedUser;
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   * Business logic: Don't actually delete, mark as inactive
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Soft delete: set status to inactive
    return await userRepository.updateById(userId, { status: USER_STATUS.INACTIVE });
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(options = {}) {
    return await userRepository.findAll(options);
  }
}

export default new UserService();

