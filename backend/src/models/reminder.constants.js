/**
 * Reminder Domain Constants
 * 
 * Centralized constants for reminder-related values.
 * This prevents magic strings throughout the codebase and makes
 * it easier to maintain and update reminder types.
 */

/**
 * Reminder Types:
 * - follow-up: General follow-up reminder for applications
 * - interview: Reminder for upcoming interviews
 * - deadline: Reminder for application deadlines
 * - response: Reminder to check for responses after applying
 */
export const REMINDER_TYPE = {
  FOLLOW_UP: 'follow-up',
  INTERVIEW: 'interview',
  DEADLINE: 'deadline',
  RESPONSE: 'response',
};

