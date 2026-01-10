import { z } from 'zod';

/**
 * AI Validation Schemas
 * 
 * Why: Validates AI-related request data before processing.
 * These schemas ensure:
 * - Job descriptions are provided and not empty
 * - Resume bullets are in correct format
 * - Input lengths are reasonable (to avoid excessive API costs)
 */

/**
 * Schema for resume match analysis
 */
export const resumeMatchSchema = z.object({
  body: z.object({
    jobDescription: z
      .string({
        required_error: 'Job description is required',
        invalid_type_error: 'Job description must be a string',
      })
      .min(50, 'Job description must be at least 50 characters')
      .max(10000, 'Job description cannot exceed 10000 characters')
      .trim(),
    jobTitle: z
      .string({
        required_error: 'Job title is required',
        invalid_type_error: 'Job title must be a string',
      })
      .min(2, 'Job title must be at least 2 characters')
      .max(200, 'Job title cannot exceed 200 characters')
      .trim(),
    company: z
      .string({
        required_error: 'Company name is required',
        invalid_type_error: 'Company name must be a string',
      })
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim(),
  }),
});

/**
 * Schema for interview preparation
 */
export const interviewPrepSchema = z.object({
  body: z.object({
    jobDescription: z
      .string({
        required_error: 'Job description is required',
        invalid_type_error: 'Job description must be a string',
      })
      .min(50, 'Job description must be at least 50 characters')
      .max(10000, 'Job description cannot exceed 10000 characters')
      .trim(),
    jobTitle: z
      .string({
        required_error: 'Job title is required',
        invalid_type_error: 'Job title must be a string',
      })
      .min(2, 'Job title must be at least 2 characters')
      .max(200, 'Job title cannot exceed 200 characters')
      .trim(),
    company: z
      .string({
        required_error: 'Company name is required',
        invalid_type_error: 'Company name must be a string',
      })
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim(),
  }),
});

/**
 * Schema for resume improvement
 */
export const resumeImprovementSchema = z.object({
  body: z.object({
    resumeBullets: z
      .array(
        z
          .string()
          .min(10, 'Each resume bullet must be at least 10 characters')
          .max(500, 'Each resume bullet cannot exceed 500 characters')
      )
      .min(1, 'At least one resume bullet is required')
      .max(10, 'Maximum 10 resume bullets allowed'),
    jobDescription: z
      .string({
        required_error: 'Job description is required',
        invalid_type_error: 'Job description must be a string',
      })
      .min(50, 'Job description must be at least 50 characters')
      .max(10000, 'Job description cannot exceed 10000 characters')
      .trim(),
    jobTitle: z
      .string({
        required_error: 'Job title is required',
        invalid_type_error: 'Job title must be a string',
      })
      .min(2, 'Job title must be at least 2 characters')
      .max(200, 'Job title cannot exceed 200 characters')
      .trim(),
  }),
});

