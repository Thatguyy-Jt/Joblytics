import { verifyAccessToken } from '../utils/jwt.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Authentication Middleware
 * 
 * Why: Protects routes by verifying JWT access tokens.
 * This middleware extracts the access token from HttpOnly cookies,
 * verifies it, and attaches the user to the request object.
 * Routes using this middleware are protected - only authenticated users can access them.
 * 
 * Responsibilities:
 * - Extract access token from cookies
 * - Verify token signature and expiration
 * - Load user from database
 * - Attach user to req.user for use in controllers
 * - Return 401 if token is missing/invalid/expired
 * 
 * Token Flow:
 * 1. Client sends request with access token in HttpOnly cookie
 * 2. Middleware extracts token from req.cookies.accessToken
 * 3. Verifies token signature and expiration
 * 4. Loads user from database using userId in token
 * 5. Attaches user to req.user
 * 6. Calls next() to continue to protected route
 */

/**
 * Middleware to authenticate requests using JWT access token from cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export async function authenticate(req, res, next) {
  try {
    // Extract access token from HttpOnly cookie
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No access token provided.',
      });
    }

    // Verify access token (checks signature and expiration)
    const decoded = verifyAccessToken(accessToken);

    // Load user from database
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
    }

    // Attach user to request object for use in controllers
    req.user = user;
    req.userId = decoded.userId;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Please refresh your token.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.',
      });
    }

    // Unexpected error
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
}

