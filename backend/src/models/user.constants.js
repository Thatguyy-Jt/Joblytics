/**
 * User Domain Constants
 * 
 * Centralized constants for user-related values.
 * This prevents magic strings/numbers throughout the codebase
 * and makes it easier to maintain and update values.
 */

export const USER_ROLES = {
  JOB_SEEKER: 'job_seeker',
  // Future roles can be added here (e.g., ADMIN, EMPLOYER)
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Validation constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 255;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

