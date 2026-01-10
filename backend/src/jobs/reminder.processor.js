import cron from 'node-cron';
import reminderService from '../services/reminder.service.js';
import EmailService from '../emails/index.js';
import { REMINDER_TYPE } from '../models/reminder.constants.js';

/**
 * Reminder Processor (Job Scheduler)
 * 
 * Why: Background job processor that periodically checks for due reminders
 * and sends email notifications. This runs independently of HTTP requests.
 * 
 * Responsibilities:
 * - Periodically query for due reminders (reminderDate <= now AND sent === false)
 * - Send email notifications via EmailService
 * - Mark reminders as sent after successful email delivery
 * - Handle errors gracefully with retry logic
 * - Log processing activity
 * 
 * Scheduling:
 * - Runs every hour to check for due reminders
 * - Can be configured to run more frequently if needed
 */
class ReminderProcessor {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Process due reminders
   * This is the main function that runs on schedule
   */
  async processDueReminders() {
    if (this.isRunning) {
      console.log('⏳ Reminder processor already running, skipping...');
      return;
    }

    this.isRunning = true;
    const now = new Date();
    console.log(`🔔 Processing due reminders at ${now.toISOString()}...`);

    try {
      // Get all due reminders
      const dueReminders = await reminderService.getDueReminders();

      if (dueReminders.length === 0) {
        console.log('✅ No due reminders found');
        this.isRunning = false;
        return;
      }

      console.log(`📧 Found ${dueReminders.length} due reminder(s):`);
      dueReminders.forEach((reminder) => {
        console.log(`   - Reminder ${reminder._id}: ${reminder.reminderType} for ${reminder.application?.company || 'Unknown'} (due: ${new Date(reminder.reminderDate).toISOString()})`);
      });

      // Process each reminder
      let successCount = 0;
      let failureCount = 0;

      for (const reminder of dueReminders) {
        try {
          console.log(`📤 Sending reminder ${reminder._id} to ${reminder.user?.email}...`);
          await this.sendReminderEmail(reminder);
          
          // Mark as sent after successful email
          await reminderService.markReminderAsSent(reminder._id.toString());
          successCount++;
          
          console.log(`✅ Successfully sent reminder ${reminder._id} to ${reminder.user?.email}`);
        } catch (error) {
          failureCount++;
          console.error(`❌ Failed to process reminder ${reminder._id}:`, error.message);
          console.error(`   Error details:`, error);
          // Don't mark as sent if email failed - will retry on next run
        }
      }

      console.log(`📊 Reminder processing complete: ${successCount} sent, ${failureCount} failed`);
    } catch (error) {
      console.error('❌ Error processing due reminders:', error.message);
      console.error('   Stack:', error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Send email for a specific reminder
   * @param {Object} reminder - Reminder object with populated user and application
   */
  async sendReminderEmail(reminder) {
    const { user, application, reminderType } = reminder;

    if (!user || !application) {
      throw new Error('Reminder missing user or application data');
    }

    // Send appropriate email based on reminder type
    switch (reminderType) {
      case REMINDER_TYPE.INTERVIEW:
        // Use interview reminder email template
        await EmailService.sendInterviewReminder(user, application);
        break;

      case REMINDER_TYPE.FOLLOW_UP:
      case REMINDER_TYPE.DEADLINE:
      case REMINDER_TYPE.RESPONSE:
      default:
        // Use generic follow-up email (can be customized later)
        await EmailService.sendFollowUpReminder(user, application, reminderType);
        break;
    }
  }

  /**
   * Start the reminder processor
   * Runs every 5 minutes to check for due reminders (more responsive)
   * Can be changed to run less frequently in production if needed
   */
  start() {
    if (this.cronJob) {
      console.log('⚠️ Reminder processor already started');
      return;
    }

    // Run every 5 minutes for better responsiveness
    // Format: '*/5 * * * *' = every 5 minutes
    // Alternative: '0 * * * *' = every hour at minute 0 (for production)
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.processDueReminders();
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    console.log('✅ Reminder processor started (runs every 5 minutes)');
    
    // Process immediately on startup (for testing/development)
    this.processDueReminders().catch((error) => {
      console.error('Error in initial reminder processing:', error.message);
    });
  }

  /**
   * Stop the reminder processor
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 Reminder processor stopped');
    }
  }

  /**
   * Manually trigger reminder processing (for testing/debugging)
   * This can be called via API endpoint or directly
   */
  async triggerNow() {
    console.log('🔔 Manually triggering reminder processing...');
    await this.processDueReminders();
  }
}

export default new ReminderProcessor();

