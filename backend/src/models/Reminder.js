import mongoose from 'mongoose';
import { REMINDER_TYPE } from './reminder.constants.js';

/**
 * Reminder Mongoose Model
 * 
 * Why: Defines the database schema for Reminder documents.
 * This model tracks reminders for job applications, allowing users
 * to set follow-up reminders and receive email notifications.
 * 
 * Responsibilities:
 * - Define schema structure (fields, types, required, defaults)
 * - Set up indexes for efficient querying of due reminders
 * - Establish relationships with User and JobApplication models
 * - Handle data validation at the database level
 */
const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true, // Index for faster queries by user
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: [true, 'Job application reference is required'],
      index: true, // Index for faster queries by application
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder date is required'],
      index: true, // Index for efficient querying of due reminders
    },
    reminderType: {
      type: String,
      enum: Object.values(REMINDER_TYPE),
      required: [true, 'Reminder type is required'],
      default: REMINDER_TYPE.FOLLOW_UP,
    },
    sent: {
      type: Boolean,
      default: false,
      index: true, // Index for querying unsent reminders
    },
    sentAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index for efficient queries: user + reminderDate + sent
// This is critical for the job scheduler to find due reminders
reminderSchema.index({ user: 1, reminderDate: 1, sent: 1 });

// Compound index for efficient queries: application + sent
reminderSchema.index({ application: 1, sent: 1 });

// Index for querying due reminders (used by job scheduler)
reminderSchema.index({ reminderDate: 1, sent: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;

