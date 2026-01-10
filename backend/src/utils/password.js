import bcrypt from 'bcrypt';

/**
 * Password Utility Functions
 * 
 * Why: Centralizes password hashing and comparison logic.
 * These functions are reusable across the application and ensure
 * consistent password security practices. Using bcrypt provides
 * one-way hashing with salt rounds for security.
 * 
 * Responsibilities:
 * - Hash passwords before storing in database
 * - Compare plain text passwords with hashed passwords
 * - Handle bcrypt errors gracefully
 */

const SALT_ROUNDS = 12; // Higher rounds = more secure but slower

/**
 * Hash a plain text password
 * @param {string} plainPassword - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
export async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If comparison fails
 */
export async function comparePassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
}

