import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../validations/auth.validation.js';
import { updateUserSchema } from '../validations/user.validation.js';

/**
 * Authentication Routes
 * 
 * Why: Defines HTTP endpoints for authentication operations.
 * Routes map HTTP methods and paths to controller functions.
 * They also apply middleware (validation, authentication) before controllers.
 * 
 * Responsibilities:
 * - Define route paths and HTTP methods
 * - Apply validation middleware (Zod schemas)
 * - Apply authentication middleware for protected routes
 * - Wire routes to controller methods
 */

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * - Validates request body with Zod schema
 * - Calls authController.register()
 * - Sets HttpOnly cookies with tokens
 */
router.post('/register', validate(registerSchema), authController.register.bind(authController));

/**
 * POST /api/auth/login
 * Login user
 * - Validates request body with Zod schema
 * - Calls authController.login()
 * - Sets HttpOnly cookies with tokens
 */
router.post('/login', validate(loginSchema), authController.login.bind(authController));

/**
 * POST /api/auth/logout
 * Logout user
 * - Clears HttpOnly cookies
 * - No authentication required (anyone can logout)
 */
router.post('/logout', authController.logout.bind(authController));

/**
 * POST /api/auth/refresh
 * Refresh access token
 * - Uses refresh token from cookie to generate new tokens
 * - Sets new HttpOnly cookies
 * - No authentication required (uses refresh token from cookie)
 */
router.post('/refresh', authController.refresh.bind(authController));

/**
 * GET /api/auth/me
 * Get current authenticated user
 * - Protected route (requires authentication middleware)
 * - Returns user information from req.user (set by middleware)
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

/**
 * PUT /api/auth/profile
 * Update user profile
 * - Protected route (requires authentication middleware)
 * - Validates request body with Zod schema
 * - Updates user profile information
 */
router.put('/profile', authenticate, validate(updateUserSchema), authController.updateProfile.bind(authController));

/**
 * POST /api/auth/forgot-password
 * Request password reset (sends reset link via email)
 * - Validates email
 * - Sends reset link to user's email
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.requestPasswordReset.bind(authController));

/**
 * POST /api/auth/reset-password
 * Reset password using reset token
 * - Validates token and new password
 * - Resets password if token is valid
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

export default router;

