import mongoose from 'mongoose';
import { USER_ROLES, USER_STATUS } from './user.constants.js';

/**
 * User Mongoose Model
 * 
 * Why: Defines the database schema and structure for User documents.
 * This is the data layer - it describes what fields exist, their types,
 * validation rules, and indexes. Mongoose provides an ODM (Object Document Mapper)
 * that translates between JavaScript objects and MongoDB documents.
 * 
 * Responsibilities:
 * - Define schema structure (fields, types, required, defaults)
 * - Set up indexes for query performance
 * - Define virtual properties and methods
 * - Handle data validation at the database level
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, 'Email cannot exceed 255 characters'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [100, 'First name cannot exceed 100 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [100, 'Last name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.JOB_SEEKER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    profile: {
      resumeSummary: {
        type: String,
        maxlength: [2000, 'Resume summary cannot exceed 2000 characters'],
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters'],
        default: '',
      },
      linkedInUrl: {
        type: String,
        trim: true,
        default: '',
      },
      portfolioUrl: {
        type: String,
        trim: true,
        default: '',
      },
    },
    passwordResetToken: {
      type: String,
      select: false, // Don't return token in queries by default
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: {
      transform: function (doc, ret) {
        // Remove password and __v from JSON output
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for query performance
// Note: email index is automatically created by unique: true, so we don't need to add it again
userSchema.index({ status: 1 }); // For filtering active users
userSchema.index({ createdAt: -1 }); // For sorting by creation date

const User = mongoose.model('User', userSchema);

export default User;

