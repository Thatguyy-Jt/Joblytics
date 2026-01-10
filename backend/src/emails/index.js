/**
 * Email Service Module
 * 
 * Why: Central export point for the email service.
 * This allows other services to easily import and use the email service
 * without needing to know the internal file structure.
 * 
 * Usage:
 * ```js
 * import EmailService from '../emails/index.js';
 * await EmailService.sendWelcomeEmail(user);
 * ```
 */

import EmailService from './email.service.js';

export default EmailService;

