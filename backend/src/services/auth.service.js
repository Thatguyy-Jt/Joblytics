import userRepository from '../repositories/user.repository.js';
import userService from './user.service.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import EmailService from '../emails/index.js';
import crypto from 'crypto';

/**
 * Authentication Service
 * 
 * Why: Handles authentication business logic separate from HTTP concerns.
 * This service orchestrates user registration, login, and token generation.
 * It uses the user service for user operations and password/token utilities
 * for security operations.
 * 
 * Responsibilities:
 * - Register new users (hash passwords, create user, generate tokens)
 * - Authenticate users (verify credentials, generate tokens)
 * - Handle password validation and hashing
 * - Generate access and refresh tokens
 * - Throw authentication-specific errors
 * 
 * Note: This service does NOT handle HTTP requests/responses or cookies.
 * That will be done in controllers.
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data (email, password, firstName, lastName)
   * @returns {Object} User object and tokens
   */
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create user with hashed password
    const user = await userService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate tokens
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Send welcome email (non-blocking - don't fail registration if email fails)
    EmailService.sendWelcomeEmail(user).catch((error) => {
      console.error('Failed to send welcome email:', error.message);
      // Don't throw - email failure shouldn't prevent registration
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Authenticate a user (login)
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Object} User object and tokens
   * @throws {Error} If credentials are invalid
   */
  async login(email, password) {
    // Find user with password included
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Check if user is active
    if (user.status !== 'active') {
      const error = new Error('Account is not active');
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Generate tokens
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Remove password from user object before returning
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Object} New access token and refresh token
   * @throws {Error} If refresh token is invalid
   */
  async refreshTokens(refreshToken) {
    // Verify refresh token (this will throw if invalid/expired)
    const decoded = verifyRefreshToken(refreshToken);

    // Get user to ensure they still exist and are active
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Account is not active');
      error.statusCode = 403;
      throw error;
    }

    // Generate new tokens
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current plain text password
   * @param {string} newPassword - New plain text password
   * @returns {Object} Updated user object
   * @throws {Error} If current password is incorrect
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user password
    const updatedUser = await userRepository.updateById(userId, {
      password: hashedNewPassword,
    });

    return updatedUser;
  }

  /**
   * Request password reset (sends reset link via email)
   * @param {string} email - User email
   * @returns {Object} Success message
   */
  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      // Return success even if user doesn't exist
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to user
    await userRepository.updateById(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetTokenExpires: tokenExpires,
    });

    // Send reset link email (non-blocking)
    EmailService.sendPasswordResetEmail(user, resetToken).catch((error) => {
      console.error('Failed to send password reset email:', error.message);
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password using reset token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Object} Success message
   * @throws {Error} If token is invalid, expired, or password is invalid
   */
  async resetPassword(token, newPassword) {
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      const error = new Error('Password must be at least 8 characters');
      error.statusCode = 400;
      throw error;
    }

    // Find user with reset token
    const userWithToken = await userRepository.findByPasswordResetToken(token);
    if (!userWithToken) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    if (!userWithToken.passwordResetToken || !userWithToken.passwordResetTokenExpires) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    // Check if token is expired
    if (new Date() > new Date(userWithToken.passwordResetTokenExpires)) {
      const error = new Error('Reset token has expired. Please request a new one');
      error.statusCode = 400;
      throw error;
    }

    // Verify token
    if (userWithToken.passwordResetToken !== token) {
      const error = new Error('Invalid reset token');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear token
    await userRepository.updateById(userWithToken._id.toString(), {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetTokenExpires: undefined,
    });

    return { message: 'Password reset successfully' };
  }
}

export default new AuthService();

