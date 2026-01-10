import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from '../models/user.constants.js';

/**
 * Authentication Validation Schemas
 * 
 * Why: Validates authentication-related request data.
 * These schemas are used by the validation middleware to ensure
 * login and registration requests have valid data before reaching controllers.
 */

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Please provide a valid email address')
      .max(EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`)
      .toLowerCase()
      .trim(),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`),
    firstName: z
      .string({
        required_error: 'First name is required',
        invalid_type_error: 'First name must be a string',
      })
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name cannot exceed 100 characters')
      .trim(),
    lastName: z
      .string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      })
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name cannot exceed 100 characters')
      .trim(),
  }),
});

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),
});

/**
 * Schema for forgot password request
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Schema for password reset
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: 'Reset token is required',
        invalid_type_error: 'Reset token must be a string',
      })
      .min(1, 'Reset token is required'),
    newPassword: z
      .string({
        required_error: 'New password is required',
        invalid_type_error: 'New password must be a string',
      })
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`),
  }),
});

