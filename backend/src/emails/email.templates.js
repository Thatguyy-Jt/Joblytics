/**
 * Email Templates
 * 
 * Why: Centralized HTML email templates for all transactional emails.
 * These templates provide consistent branding and styling across all emails.
 * 
 * Template Design:
 * - Responsive HTML that works in all email clients
 * - Inline CSS for maximum compatibility
 * - Clear call-to-action buttons
 * - Professional styling
 * - Easy to extend for new email types
 */

/**
 * Base email template wrapper
 * @param {string} content - HTML content to wrap
 * @param {string} title - Email title/subject preview
 * @returns {string} Complete HTML email
 */
function baseTemplate(content, title = 'Job Tracker') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Job Tracker</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                This is an automated email from Job Tracker.<br>
                If you didn't request this email, please ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Welcome email template
 * @param {string} userName - User's first name
 * @returns {string} HTML email
 */
export function getWelcomeEmailTemplate(userName) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">Welcome to Job Tracker! 👋</h2>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      We're excited to have you on board! Job Tracker is your all-in-one platform for managing job applications, 
      tracking your progress, and leveraging AI-powered insights to improve your job search.
    </p>
    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 10px; color: #212529; font-size: 18px; font-weight: 600;">What you can do:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
        <li>Track all your job applications in one place</li>
        <li>Get AI-powered resume matching analysis</li>
        <li>Receive personalized interview preparation tips</li>
        <li>Improve your resume with AI suggestions</li>
        <li>View analytics and track your progress</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Get Started
      </a>
    </div>
    <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  `;
  return baseTemplate(content, 'Welcome to Job Tracker');
}

/**
 * Password reset email template
 * @param {string} userName - User's first name
 * @param {string} resetToken - Password reset token
 * @returns {string} HTML email
 */
export function getPasswordResetEmailTemplate(userName, resetToken) {
  // Use process.env directly to avoid circular dependency issues
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin: 0 0 20px; padding: 12px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all; color: #495057; font-size: 13px; font-family: monospace;">
      ${resetUrl}
    </p>
    <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, 
        please ignore this email and your password will remain unchanged.
      </p>
    </div>
  `;
  return baseTemplate(content, 'Reset Your Password');
}

/**
 * Interview reminder email template
 * @param {string} userName - User's first name
 * @param {Object} application - Job application object
 * @returns {string} HTML email
 */
export function getInterviewReminderEmailTemplate(userName, application) {
  const company = application.company || 'the company';
  const jobTitle = application.jobTitle || 'the position';
  const interviewDate = application.dateApplied 
    ? new Date(application.dateApplied).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'soon';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">Interview Reminder 📅</h2>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      This is a friendly reminder about your upcoming interview:
    </p>
    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 15px; color: #212529; font-size: 18px; font-weight: 600;">Interview Details</h3>
      <p style="margin: 0 0 10px; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Company:</strong> ${company}
      </p>
      <p style="margin: 0 0 10px; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Position:</strong> ${jobTitle}
      </p>
      <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Date:</strong> ${interviewDate}
      </p>
    </div>
    <div style="margin: 30px 0; padding: 15px; background-color: #d1ecf1; border-radius: 6px; border-left: 4px solid #0dcaf0;">
      <h3 style="margin: 0 0 10px; color: #212529; font-size: 16px; font-weight: 600;">💡 Quick Tips:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 14px; line-height: 1.8;">
        <li>Review the job description and your resume</li>
        <li>Prepare questions to ask the interviewer</li>
        <li>Check your AI-generated interview prep tips in the app</li>
        <li>Test your technology setup if it's a virtual interview</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications/${application._id || ''}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View Application Details
      </a>
    </div>
    <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      Good luck with your interview! 🍀
    </p>
  `;
  return baseTemplate(content, 'Interview Reminder');
}

/**
 * AI report ready email template
 * @param {string} userName - User's first name
 * @param {string} reportType - Type of AI report (resume-match, interview-prep, resume-improvement)
 * @param {string} applicationId - Job application ID
 * @returns {string} HTML email
 */
export function getAIReportReadyEmailTemplate(userName, reportType, applicationId) {
  const reportNames = {
    'resume-match': 'Resume Match Analysis',
    'interview-prep': 'Interview Preparation Tips',
    'resume-improvement': 'Resume Improvement Suggestions',
  };
  
  const reportName = reportNames[reportType] || 'AI Report';
  const reportDescriptions = {
    'resume-match': 'Your resume match analysis is ready! See how well your resume aligns with the job requirements.',
    'interview-prep': 'Your personalized interview preparation tips are ready! Get ready to ace your interview.',
    'resume-improvement': 'Your resume improvement suggestions are ready! Enhance your resume to stand out.',
  };
  
  const description = reportDescriptions[reportType] || 'Your AI report is ready!';
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">${reportName} Ready! 🤖</h2>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      ${description}
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications/${applicationId || ''}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View ${reportName}
      </a>
    </div>
    <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      Log in to your dashboard to see the full analysis and insights.
    </p>
  `;
  return baseTemplate(content, `${reportName} Ready`);
}

/**
 * Follow-up reminder email template
 * @param {string} userName - User's first name
 * @param {Object} application - Job application object
 * @param {string} reminderType - Type of reminder (follow-up, deadline, response)
 * @returns {string} HTML email
 */
export function getFollowUpReminderEmailTemplate(userName, application, reminderType = 'follow-up') {
  const company = application.company || 'the company';
  const jobTitle = application.jobTitle || 'the position';
  
  const reminderMessages = {
    'follow-up': {
      title: 'Follow-up Reminder 📝',
      message: 'This is a reminder to follow up on your job application.',
      action: 'Follow up on your application',
    },
    'deadline': {
      title: 'Application Deadline Reminder ⏰',
      message: 'This is a reminder about an upcoming application deadline.',
      action: 'Check application deadline',
    },
    'response': {
      title: 'Response Check Reminder 📬',
      message: 'This is a reminder to check for responses to your application.',
      action: 'Check for responses',
    },
  };

  const reminder = reminderMessages[reminderType] || reminderMessages['follow-up'];
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">${reminder.title}</h2>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
      ${reminder.message}
    </p>
    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 15px; color: #212529; font-size: 18px; font-weight: 600;">Application Details</h3>
      <p style="margin: 0 0 10px; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Company:</strong> ${company}
      </p>
      <p style="margin: 0 0 10px; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Position:</strong> ${jobTitle}
      </p>
      <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
        <strong>Status:</strong> ${application.status || 'Applied'}
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/applications/${application._id || ''}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        ${reminder.action}
      </a>
    </div>
    <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      Stay organized and keep track of your job search progress!
    </p>
  `;
  return baseTemplate(content, reminder.title);
}

