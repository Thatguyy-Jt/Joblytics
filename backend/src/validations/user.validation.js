import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from '../models/user.constants.js';

/**
 * User Validation Schemas (Zod)
 * 
 * Why: Validates user input before it reaches business logic.
 * This layer ensures data integrity and provides clear error messages.
 * Zod schemas:
 * - Validate data types, formats, and constraints
 * - Provide automatic error messages
 * - Can be reused in both request validation and service layer
 * - Type-safe (if using TypeScript)
 * 
 * Responsibilities:
 * - Validate request body, query params, and route params
 * - Ensure data meets business rules (email format, password strength)
 * - Sanitize input (trim, lowercase where appropriate)
 * - Return clear validation error messages
 */

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
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
      .min(NAME_MIN_LENGTH, `First name must be at least ${NAME_MIN_LENGTH} characters`)
      .max(NAME_MAX_LENGTH, `First name cannot exceed ${NAME_MAX_LENGTH} characters`)
      .trim(),
    lastName: z
      .string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      })
      .min(NAME_MIN_LENGTH, `Last name must be at least ${NAME_MIN_LENGTH} characters`)
      .max(NAME_MAX_LENGTH, `Last name cannot exceed ${NAME_MAX_LENGTH} characters`)
      .trim(),
  }),
});

/**
 * Schema for updating user profile
 */
export const updateUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .max(EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`)
      .toLowerCase()
      .trim()
      .optional(),
    firstName: z
      .string()
      .min(NAME_MIN_LENGTH, `First name must be at least ${NAME_MIN_LENGTH} characters`)
      .max(NAME_MAX_LENGTH, `First name cannot exceed ${NAME_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .or(z.literal('')),
    lastName: z
      .string()
      .min(NAME_MIN_LENGTH, `Last name must be at least ${NAME_MIN_LENGTH} characters`)
      .max(NAME_MAX_LENGTH, `Last name cannot exceed ${NAME_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .or(z.literal('')),
    profile: z
      .object({
        resumeSummary: z
          .string()
          .max(2000, 'Resume summary cannot exceed 2000 characters')
          .optional()
          .or(z.literal('')),
        phone: z.string().trim().optional().or(z.literal('')),
        location: z.string().max(200, 'Location cannot exceed 200 characters').trim().optional().or(z.literal('')),
        linkedInUrl: z
          .string()
          .url('Please provide a valid LinkedIn URL')
          .trim()
          .optional()
          .or(z.literal('')),
        portfolioUrl: z
          .string()
          .url('Please provide a valid portfolio URL')
          .trim()
          .optional()
          .or(z.literal('')),
      })
      .refine(
        (data) => {
          const hasLinkedIn = data.linkedInUrl && data.linkedInUrl.trim() !== '';
          const hasPortfolio = data.portfolioUrl && data.portfolioUrl.trim() !== '';
          return hasLinkedIn || hasPortfolio;
        },
        {
          message: 'Please provide either a LinkedIn URL or Portfolio URL (at least one is required)',
          path: ['linkedInUrl'], // Error will be shown on linkedInUrl field
        }
      )
      .optional(),
  }),
});

/**
 * Schema for user ID parameter
 */
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
  }),
});

/**
 * Schema for query parameters (pagination, filtering)
 */
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive number')
      .transform(Number)
      .pipe(z.number().int().positive())
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .pipe(z.number().int().positive().max(100))
      .optional()
      .default('10'),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    role: z.enum(['job_seeker']).optional(),
  }),
});

