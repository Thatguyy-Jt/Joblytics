/**
 * Job Application Domain Constants
 * 
 * Centralized constants for job application-related values.
 * This prevents magic strings throughout the codebase and makes
 * it easier to maintain and update status values.
 */

/**
 * Job Application Status Flow:
 * Saved → Applied → Interview → Offer → Rejected
 * 
 * Users can move between statuses as their application progresses.
 */
export const APPLICATION_STATUS = {
  SAVED: 'saved',           // Job saved but not yet applied
  APPLIED: 'applied',        // Application submitted
  INTERVIEW: 'interview',    // Interview scheduled/in progress
  OFFER: 'offer',           // Job offer received
  REJECTED: 'rejected',     // Application rejected
};

// Validation constants
export const COMPANY_NAME_MAX_LENGTH = 200;
export const JOB_TITLE_MAX_LENGTH = 200;
export const JOB_LINK_MAX_LENGTH = 500;
export const SOURCE_MAX_LENGTH = 200;
export const NOTES_MAX_LENGTH = 5000;

