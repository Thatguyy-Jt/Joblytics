/**
 * Validation Middleware
 * 
 * Why: Validates request data using Zod schemas before it reaches controllers.
 * This middleware runs Zod validation and returns formatted error responses
 * if validation fails, keeping controllers clean.
 * 
 * Responsibilities:
 * - Run Zod schema validation on request data
 * - Format validation errors for client
 * - Call next() if validation passes
 * - Return 400 with error details if validation fails
 */

/**
 * Validates request data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Validate request data (body, params, query) against schema
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // If validation passes, continue to next middleware/controller
      next();
    } catch (error) {
      // If validation fails, return formatted error response
      if (error.issues) {
        // Zod validation error
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        // Log validation errors for debugging
        console.error('Validation failed:', {
          errors,
          body: req.body,
          path: req.path,
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          error: errors[0]?.message || 'Validation error',
        });
      }

      // Unexpected error
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
  };
}

