import express from 'express';
import reminderProcessor from '../jobs/reminder.processor.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * Admin Routes
 * 
 * Why: Provides admin/debugging endpoints for system operations.
 * These routes are useful for testing and manual operations.
 * 
 * Note: In production, these should be protected with admin role checks
 */
const router = express.Router();

// All routes require authentication (add admin check in production)
router.use(authenticate);

/**
 * POST /api/admin/reminders/process
 * Manually trigger reminder processing
 * Useful for testing or immediate processing
 */
router.post('/reminders/process', async (req, res) => {
  try {
    await reminderProcessor.triggerNow();
    res.status(200).json({
      success: true,
      message: 'Reminder processing triggered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger reminder processing',
      error: error.message,
    });
  }
});

export default router;

