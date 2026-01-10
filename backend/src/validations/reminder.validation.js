import { z } from 'zod';
import { REMINDER_TYPE } from '../models/reminder.constants.js';

/**
 * Reminder Validation Schemas
 * 
 * Why: Validates reminder request data before it reaches controllers.
 * These schemas ensure data integrity and provide clear error messages.
 */

/**
 * Schema for creating a reminder
 */
export const createReminderSchema = z.object({
  body: z.object({
    applicationId: z
      .string({
        required_error: 'Application ID is required',
        invalid_type_error: 'Application ID must be a string',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
    reminderDate: z
      .string({
        required_error: 'Reminder date is required',
        invalid_type_error: 'Reminder date must be a string',
      })
      .datetime('Please provide a valid ISO datetime string')
      .transform((str) => new Date(str))
      .refine((date) => date > new Date(), {
        message: 'Reminder date must be in the future',
      }),
    reminderType: z
      .enum(Object.values(REMINDER_TYPE), {
        errorMap: () => ({ message: 'Invalid reminder type' }),
      })
      .optional()
      .default(REMINDER_TYPE.FOLLOW_UP),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .trim()
      .optional()
      .default(''),
  }),
});

/**
 * Schema for updating a reminder
 */
export const updateReminderSchema = z.object({
  body: z.object({
    reminderDate: z
      .string()
      .datetime('Please provide a valid ISO datetime string')
      .transform((str) => new Date(str))
      .refine((date) => date > new Date(), {
        message: 'Reminder date must be in the future',
      })
      .optional(),
    reminderType: z
      .enum(Object.values(REMINDER_TYPE), {
        errorMap: () => ({ message: 'Invalid reminder type' }),
      })
      .optional(),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .trim()
      .optional(),
  }),
});

/**
 * Schema for reminder ID parameter
 */
export const reminderIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reminder ID format'),
  }),
});

/**
 * Schema for query parameters (pagination, filtering)
 */
export const getRemindersQuerySchema = z.object({
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
    applicationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format')
      .optional(),
    reminderType: z.enum(Object.values(REMINDER_TYPE)).optional(),
    sent: z
      .string()
      .transform((val) => val === 'true')
      .pipe(z.boolean())
      .optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z
      .enum(['reminderDate', 'createdAt', 'updatedAt'])
      .optional()
      .default('reminderDate'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

