import mongoose from 'mongoose';
import { APPLICATION_STATUS } from './jobApplication.constants.js';

/**
 * Job Application Mongoose Model
 * 
 * Why: Defines the database schema for Job Application documents.
 * This model includes a reference to the User model to establish
 * ownership - each job application belongs to a specific user.
 * 
 * Responsibilities:
 * - Define schema structure (fields, types, required, defaults)
 * - Set up indexes for query performance
 * - Establish relationship with User model via user reference
 * - Handle data validation at the database level
 */
const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true, // Index for faster queries by user
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    jobLink: {
      type: String,
      trim: true,
      maxlength: [500, 'Job link cannot exceed 500 characters'],
      default: '',
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: [10000, 'Job description cannot exceed 10000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SAVED,
      index: true, // Index for filtering by status
    },
    dateApplied: {
      type: Date,
      default: null, // Can be null if status is 'saved'
    },
    source: {
      type: String,
      trim: true,
      maxlength: [200, 'Source cannot exceed 200 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    // AI-generated insights for this job application
    aiInsights: {
      resumeMatch: {
        matchScore: { type: Number, min: 0, max: 100, default: null },
        strengths: { type: [String], default: [] },
        gaps: { type: [String], default: [] },
        suggestions: { type: [String], default: [] },
        summary: { type: String, default: '' },
        analyzedAt: { type: Date, default: null },
      },
      interviewPrep: {
        likelyQuestions: { type: [String], default: [] },
        technicalTopics: { type: [String], default: [] },
        talkingPoints: { type: [String], default: [] },
        preparationSteps: { type: [String], default: [] },
        questionsToAsk: { type: [String], default: [] },
        summary: { type: String, default: '' },
        generatedAt: { type: Date, default: null },
      },
      resumeImprovement: {
        improvedBullets: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        keywords: { type: [String], default: [] },
        summary: { type: String, default: '' },
        generatedAt: { type: Date, default: null },
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index for efficient queries: user + status
jobApplicationSchema.index({ user: 1, status: 1 });

// Compound index for efficient queries: user + createdAt (for sorting)
jobApplicationSchema.index({ user: 1, createdAt: -1 });

// Index for date applied queries
jobApplicationSchema.index({ user: 1, dateApplied: -1 });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;

