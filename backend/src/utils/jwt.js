import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * JWT Token Utility Functions
 * 
 * Why: Centralizes JWT token generation and verification.
 * These functions handle access tokens (short-lived) and refresh tokens
 * (long-lived) with different secrets and expiration times. This separation
 * provides better security - if an access token is compromised, it expires quickly.
 * 
 * Responsibilities:
 * - Generate access tokens (short-lived, 15 minutes)
 * - Generate refresh tokens (long-lived, 7 days)
 * - Verify token signatures and expiration
 * - Extract payload data from tokens
 * - Handle token errors gracefully
 */

/**
 * Generate an access token
 * @param {Object} payload - Token payload (typically userId)
 * @returns {string} Signed JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
}

/**
 * Generate a refresh token
 * @param {Object} payload - Token payload (typically userId)
 * @returns {string} Signed JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify an access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Access token has expired');
      err.name = 'TokenExpiredError';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid access token');
      err.name = 'JsonWebTokenError';
      throw err;
    }
    throw new Error('Failed to verify access token');
  }
}

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Refresh token has expired');
      err.name = 'TokenExpiredError';
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid refresh token');
      err.name = 'JsonWebTokenError';
      throw err;
    }
    throw new Error('Failed to verify refresh token');
  }
}

/**
 * Decode a token without verification (for debugging/inspection)
 * WARNING: This does not verify the signature, use only for debugging
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

