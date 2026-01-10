import nodemailer from 'nodemailer';
import config from '../config/index.js';
import {
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getInterviewReminderEmailTemplate,
  getAIReportReadyEmailTemplate,
  getFollowUpReminderEmailTemplate,
} from './email.templates.js';

/**
 * Email Service
 * 
 * Why: Centralized email sending service that handles all transactional emails.
 * This service abstracts away the email provider (SMTP, Resend, SendGrid) and
 * provides a consistent interface for sending emails throughout the application.
 * 
 * Responsibilities:
 * - Initialize email transporter based on EMAIL_SERVICE config
 * - Send various types of transactional emails
 * - Handle errors gracefully without crashing the application
 * - Log email sending attempts and failures
 * - Support multiple email providers (SMTP, Resend, SendGrid, Stub)
 * 
 * Email Types:
 * - Welcome emails for new users
 * - Password reset emails
 * - Interview reminder emails
 * - AI report ready notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize email transporter based on EMAIL_SERVICE configuration
   */
  init() {
    try {
      switch (config.EMAIL_SERVICE) {
        case 'smtp':
          if (!config.SMTP_HOST || !config.SMTP_PORT || !config.SMTP_USER || !config.SMTP_PASS) {
            console.error('❌ SMTP configuration incomplete. Falling back to stub mode.');
            this.transporter = this.createStubTransporter();
            this.initialized = false;
            break;
          }
          this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_SECURE, // true for 465, false for other ports
            auth: {
              user: config.SMTP_USER,
              pass: config.SMTP_PASS,
            },
          });
          console.log(`✅ Email Service: SMTP configured (${config.SMTP_HOST}:${config.SMTP_PORT})`);
          break;

        case 'resend':
          if (!config.RESEND_API_KEY || config.RESEND_API_KEY.trim() === '') {
            console.error('❌ RESEND_API_KEY not configured. Falling back to stub mode.');
            this.transporter = this.createStubTransporter();
            this.initialized = false;
            break;
          }
          // Resend SMTP endpoint (works with nodemailer)
          this.transporter = nodemailer.createTransport({
            host: 'smtp.resend.com',
            port: 587,
            secure: false,
            auth: {
              user: 'resend',
              pass: config.RESEND_API_KEY,
            },
          });
          console.log('✅ Email Service: Resend configured (using SMTP)');
          break;

        case 'sendgrid':
          if (!config.SENDGRID_API_KEY || config.SENDGRID_API_KEY.trim() === '') {
            console.error('❌ SENDGRID_API_KEY not configured. Falling back to stub mode.');
            this.transporter = this.createStubTransporter();
            this.initialized = false;
            break;
          }
          // SendGrid SMTP endpoint (works with nodemailer)
          this.transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
              user: 'apikey',
              pass: config.SENDGRID_API_KEY,
            },
          });
          console.log('✅ Email Service: SendGrid configured (using SMTP)');
          break;

        case 'stub':
        default:
          this.transporter = this.createStubTransporter();
          console.log('📧 Email Service: Stub mode (emails logged to console, not sent)');
          break;
      }

      this.initialized = true;
      
      // Verify connection for real email services
      if (config.EMAIL_SERVICE !== 'stub' && this.transporter && this.transporter.verify) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ Email service verification failed:', error.message);
            console.error('   Emails may not be sent. Check your configuration.');
          } else {
            console.log('✅ Email service connection verified successfully');
          }
        });
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = this.createStubTransporter();
      this.initialized = false;
    }
  }

  /**
   * Create a stub transporter for development/testing
   * Logs emails to console instead of sending
   */
  createStubTransporter() {
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 [STUB EMAIL] Would send email:');
        console.log('   To:', mailOptions.to);
        console.log('   Subject:', mailOptions.subject);
        console.log('   From:', mailOptions.from);
        console.log('   HTML Length:', mailOptions.html?.length || 0, 'characters');
        return {
          messageId: `stub-${Date.now()}`,
          accepted: [mailOptions.to],
          rejected: [],
        };
      },
    };
  }

  /**
   * Send email using the configured transporter
   * @param {Object} options - Email options (to, subject, html)
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    if (!this.initialized || !this.transporter) {
      console.error('❌ Email service not initialized');
      throw new Error('Email service not initialized');
    }

    try {
      const mailOptions = {
        from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      // Log email attempt (but not in stub mode to avoid duplicate logs)
      if (config.EMAIL_SERVICE !== 'stub') {
        console.log(`📤 Sending email to ${options.to} via ${config.EMAIL_SERVICE}...`);
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      if (config.EMAIL_SERVICE !== 'stub') {
        console.log(`✅ Email sent successfully to ${options.to}`);
        console.log(`   Message ID: ${result.messageId || 'N/A'}`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error.message);
      console.error(`   Error details:`, error);
      
      // Don't throw - email failures shouldn't crash the application
      // Log the error but return a failure indicator
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Convert HTML to plain text (simple implementation)
   * @param {string} html - HTML content
   * @returns {string} Plain text version
   */
  htmlToText(html) {
    if (!html) return '';
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object with firstName and email
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(user) {
    try {
      const html = getWelcomeEmailTemplate(user.firstName || user.name || 'there');
      return await this.sendEmail({
        to: user.email,
        subject: 'Welcome to Job Tracker! 🎉',
        html,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object with firstName and email
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const html = getPasswordResetEmailTemplate(user.firstName || user.name || 'there', resetToken);
      return await this.sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Joblytics',
        html,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send interview reminder email
   * @param {Object} user - User object with firstName and email
   * @param {Object} application - Job application object
   * @returns {Promise<Object>} Send result
   */
  async sendInterviewReminder(user, application) {
    try {
      const html = getInterviewReminderEmailTemplate(user.firstName || user.name || 'there', application);
      return await this.sendEmail({
        to: user.email,
        subject: `Interview Reminder: ${application.company || 'Upcoming Interview'}`,
        html,
      });
    } catch (error) {
      console.error('Error sending interview reminder email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send AI report ready notification email
   * @param {Object} user - User object with firstName and email
   * @param {string} reportType - Type of report (resume-match, interview-prep, resume-improvement)
   * @param {string} applicationId - Job application ID
   * @returns {Promise<Object>} Send result
   */
  async sendAIReportReadyEmail(user, reportType, applicationId) {
    try {
      const html = getAIReportReadyEmailTemplate(
        user.firstName || user.name || 'there',
        reportType,
        applicationId
      );
      
      const reportNames = {
        'resume-match': 'Resume Match Analysis',
        'interview-prep': 'Interview Preparation Tips',
        'resume-improvement': 'Resume Improvement Suggestions',
      };
      
      const subject = `${reportNames[reportType] || 'AI Report'} Ready - Job Tracker`;
      
      return await this.sendEmail({
        to: user.email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending AI report ready email:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send follow-up reminder email
   * @param {Object} user - User object with firstName and email
   * @param {Object} application - Job application object
   * @param {string} reminderType - Type of reminder (follow-up, deadline, response)
   * @returns {Promise<Object>} Send result
   */
  async sendFollowUpReminder(user, application, reminderType = 'follow-up') {
    try {
      const html = getFollowUpReminderEmailTemplate(
        user.firstName || user.name || 'there',
        application,
        reminderType
      );
      
      const subjects = {
        'follow-up': `Follow-up Reminder: ${application.company || 'Your Application'}`,
        'deadline': `Deadline Reminder: ${application.company || 'Application Deadline'}`,
        'response': `Response Check: ${application.company || 'Your Application'}`,
      };
      
      const subject = subjects[reminderType] || subjects['follow-up'];
      
      return await this.sendEmail({
        to: user.email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Error sending follow-up reminder email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();

