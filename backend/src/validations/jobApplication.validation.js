import { z } from 'zod';
import {
  APPLICATION_STATUS,
  COMPANY_NAME_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  JOB_LINK_MAX_LENGTH,
  SOURCE_MAX_LENGTH,
  NOTES_MAX_LENGTH,
} from '../models/jobApplication.constants.js';

/**
 * Job Application Validation Schemas
 * 
 * Why: Validates job application request data before it reaches controllers.
 * These schemas ensure data integrity and provide clear error messages.
 */

/**
 * Schema for creating a job application
 */
export const createJobApplicationSchema = z.object({
  body: z.object({
    company: z
      .string({
        required_error: 'Company name is required',
        invalid_type_error: 'Company name must be a string',
      })
      .min(1, 'Company name is required')
      .max(COMPANY_NAME_MAX_LENGTH, `Company name cannot exceed ${COMPANY_NAME_MAX_LENGTH} characters`)
      .trim(),
    jobTitle: z
      .string({
        required_error: 'Job title is required',
        invalid_type_error: 'Job title must be a string',
      })
      .min(1, 'Job title is required')
      .max(JOB_TITLE_MAX_LENGTH, `Job title cannot exceed ${JOB_TITLE_MAX_LENGTH} characters`)
      .trim(),
    jobLink: z
      .string()
      .url('Please provide a valid URL')
      .max(JOB_LINK_MAX_LENGTH, `Job link cannot exceed ${JOB_LINK_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .or(z.literal('')),
    jobDescription: z
      .string()
      .max(10000, 'Job description cannot exceed 10000 characters')
      .trim()
      .optional()
      .default(''),
    status: z
      .enum(Object.values(APPLICATION_STATUS), {
        errorMap: () => ({ message: 'Invalid status value' }),
      })
      .optional()
      .default(APPLICATION_STATUS.SAVED),
    dateApplied: z
      .string()
      .datetime('Please provide a valid date')
      .transform((str) => new Date(str))
      .optional()
      .nullable(),
    source: z
      .string()
      .max(SOURCE_MAX_LENGTH, `Source cannot exceed ${SOURCE_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .default(''),
    notes: z
      .string()
      .max(NOTES_MAX_LENGTH, `Notes cannot exceed ${NOTES_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .default(''),
  }),
});

/**
 * Schema for updating a job application
 */
export const updateJobApplicationSchema = z.object({
  body: z.object({
    company: z
      .string()
      .min(1, 'Company name cannot be empty')
      .max(COMPANY_NAME_MAX_LENGTH, `Company name cannot exceed ${COMPANY_NAME_MAX_LENGTH} characters`)
      .trim()
      .optional(),
    jobTitle: z
      .string()
      .min(1, 'Job title cannot be empty')
      .max(JOB_TITLE_MAX_LENGTH, `Job title cannot exceed ${JOB_TITLE_MAX_LENGTH} characters`)
      .trim()
      .optional(),
    jobLink: z
      .string()
      .url('Please provide a valid URL')
      .max(JOB_LINK_MAX_LENGTH, `Job link cannot exceed ${JOB_LINK_MAX_LENGTH} characters`)
      .trim()
      .optional()
      .or(z.literal('')),
    jobDescription: z
      .string()
      .max(10000, 'Job description cannot exceed 10000 characters')
      .trim()
      .optional(),
    status: z
      .enum(Object.values(APPLICATION_STATUS), {
        errorMap: () => ({ message: 'Invalid status value' }),
      })
      .optional(),
    dateApplied: z
      .string()
      .datetime('Please provide a valid date')
      .transform((str) => new Date(str))
      .optional()
      .nullable(),
    source: z
      .string()
      .max(SOURCE_MAX_LENGTH, `Source cannot exceed ${SOURCE_MAX_LENGTH} characters`)
      .trim()
      .optional(),
    notes: z
      .string()
      .max(NOTES_MAX_LENGTH, `Notes cannot exceed ${NOTES_MAX_LENGTH} characters`)
      .trim()
      .optional(),
  }),
});

/**
 * Schema for job application ID parameter
 */
export const jobApplicationIdParamSchema = z.object({
  params: z.object({
    applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid application ID format'),
  }),
});

/**
 * Schema for query parameters (pagination, filtering)
 */
export const getJobApplicationsQuerySchema = z.object({
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
    status: z.enum(Object.values(APPLICATION_STATUS)).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dateApplied', 'company', 'jobTitle']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

/**
 * Schema for resume improvement request body
 */
export const resumeImprovementBodySchema = z.object({
  body: z.object({
    resumeBullets: z
      .array(z.string().min(1, 'Resume bullet cannot be empty'))
      .min(1, 'At least one resume bullet is required')
      .max(20, 'Cannot exceed 20 resume bullets'),
  }),
});

