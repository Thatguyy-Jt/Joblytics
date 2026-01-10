import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import config from '../config/index.js';

/**
 * Authentication Controller
 * 
 * Why: Handles HTTP requests and responses for authentication.
 * Controllers are the HTTP layer - they receive requests, call services
 * for business logic, and send responses. They handle:
 * - Setting HttpOnly cookies for tokens
 * - Formatting HTTP responses
 * - Error handling and status codes
 * 
 * Responsibilities:
 * - Extract data from HTTP requests (body, params, cookies)
 * - Call service layer for business logic
 * - Set HttpOnly cookies for tokens
 * - Format and send HTTP responses
 * - Handle HTTP-specific errors
 * 
 * Cookie Flow:
 * 1. Register/Login: Service generates tokens → Controller sets HttpOnly cookies
 * 2. Browser automatically sends cookies with every request
 * 3. Middleware extracts token from cookie to authenticate requests
 * 4. Logout: Controller clears cookies
 * 
 * HttpOnly Cookies Security:
 * - HttpOnly: JavaScript cannot access (prevents XSS attacks)
 * - Secure: Only sent over HTTPS (in production)
 * - SameSite: Prevents CSRF attacks
 * - MaxAge: Sets expiration time
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Call service to register user and generate tokens
      const { user, tokens } = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // Set HttpOnly cookies for tokens
      this.setTokenCookies(res, tokens);

      // Return success response with user data (tokens are in cookies, not response body)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            profile: user.profile,
          },
        },
      });
    } catch (error) {
      // #region agent log
      try {
        const fs = await import('fs');
        const logData = JSON.stringify({location:'auth.controller.js:69',message:'Register error handler',data:{statusCode:error.statusCode||500,errorMessage:error.message,errorType:error.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}) + '\n';
        fs.appendFileSync('c:\\Users\\HP\\Desktop\\Ai job application tracker\\.cursor\\debug.log', logData);
      } catch {}
      // #endregion
      
      // Handle service errors
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      // Call service to authenticate and generate tokens
      const { user, tokens } = await authService.login(email, password);

      // Set HttpOnly cookies for tokens (30 days if rememberMe, otherwise 7 days)
      this.setTokenCookies(res, tokens, rememberMe);

      // Return success response with user data
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            profile: user.profile,
          },
        },
      });
    } catch (error) {
      // Handle service errors
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // Clear token cookies
      this.clearTokenCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message,
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    try {
      // Extract refresh token from cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
      }

      // Call service to refresh tokens
      const { tokens } = await authService.refreshTokens(refreshToken);

      // Set new HttpOnly cookies
      this.setTokenCookies(res, tokens);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   * Protected route - requires authentication middleware
   */
  async getMe(req, res) {
    try {
      // User is attached to req by authenticate middleware
      const user = req.user;

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            profile: user.profile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
        error: error.message,
      });
    }
  }

  /**
   * Request password reset (sends reset link via email)
   * POST /api/auth/forgot-password
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to send reset link',
      });
    }
  }

  /**
   * Reset password using reset token
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to reset password',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   * Protected route - requires authentication middleware
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user._id.toString();
      const updateData = req.body;

      // Update user profile
      const updatedUser = await userService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser._id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            status: updatedUser.status,
            profile: updatedUser.profile,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          },
        },
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  /**
   * Helper: Set HttpOnly cookies for access and refresh tokens
   * @param {Object} res - Express response object
   * @param {Object} tokens - Object with accessToken and refreshToken
   * @param {boolean} rememberMe - If true, set cookies to expire in 30 days, otherwise 7 days
   */
  setTokenCookies(res, tokens, rememberMe = false) {
    const cookieOptions = {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: config.COOKIE_SECURE, // Only send over HTTPS in production
      sameSite: config.COOKIE_SAME_SITE, // CSRF protection
    };

    // Set domain if configured
    if (config.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
    }

    // Set refresh token expiration based on rememberMe
    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 days
      : 7 * 24 * 60 * 60 * 1000;  // 7 days

    // Set access token cookie (15 minutes expiration)
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie (30 days if rememberMe, otherwise 7 days)
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge,
    });
  }

  /**
   * Helper: Clear token cookies
   * @param {Object} res - Express response object
   */
  clearTokenCookies(res) {
    const cookieOptions = {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE,
      path: '/', // Explicitly set path to match cookie setting
    };

    if (config.COOKIE_DOMAIN) {
      cookieOptions.domain = config.COOKIE_DOMAIN;
    }

    // Clear both cookies
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}

export default new AuthController();

