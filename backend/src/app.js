import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import jobApplicationRoutes from './routes/jobApplication.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * JSON Parsing Middleware
 * 
 * Why: Allows Express to automatically parse JSON request bodies.
 * When a client sends data with Content-Type: application/json,
 * this middleware converts the JSON string into a JavaScript object
 * and makes it available in req.body. Without this, req.body would
 * be undefined for JSON requests.
 * 
 * Example: POST /api/jobs with { "company": "Google" } 
 *          → req.body = { company: "Google" }
 */
app.use(express.json());

/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * 
 * Why: Enables the frontend (running on a different origin/port)
 * to make requests to this backend API. By default, browsers block
 * cross-origin requests for security. This middleware adds the necessary
 * headers (Access-Control-Allow-Origin, etc.) to allow requests from
 * the frontend URL specified in config.
 * 
 * Without CORS: Frontend at http://localhost:3000 cannot call
 *                Backend at http://localhost:5000
 * 
 * With CORS: Frontend can make requests, and credentials (cookies)
 *            can be included in cross-origin requests.
 */
// CORS configuration: In development, allow any localhost origin for flexibility
// In production, use the configured FRONTEND_URL
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or health checks)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow any localhost origin
    if (config.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // In production, allow the configured FRONTEND_URL
    // Also allow Render's internal health checks (no origin)
    if (origin === config.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // For production, be more lenient - allow if it matches the frontend URL pattern
    if (config.NODE_ENV === 'production' && config.FRONTEND_URL) {
      try {
        const frontendUrl = new URL(config.FRONTEND_URL);
        const originUrl = new URL(origin);
        // Allow same domain
        if (originUrl.origin === frontendUrl.origin) {
          return callback(null, true);
        }
      } catch (e) {
        // Invalid URL, continue to error
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent with cross-origin requests
};
app.use(cors(corsOptions));

/**
 * Cookie Parser Middleware
 * 
 * Why: Parses cookies from the Cookie header and makes them available
 * in req.cookies as a JavaScript object. This is essential for JWT
 * authentication using HttpOnly cookies, as the browser automatically
 * sends cookies with each request, and we need to read them server-side.
 * 
 * Without cookie-parser: req.cookies is undefined
 * 
 * With cookie-parser: req.cookies = { refreshToken: "abc123", ... }
 * 
 * This is critical for our refresh token flow where tokens are stored
 * in HttpOnly cookies for security (not accessible to JavaScript).
 */
app.use(cookieParser());

// ============================================
// ROUTES
// ============================================

// Health check endpoint (useful for deployment)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Job application routes
app.use('/api/applications', jobApplicationRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Reminder routes
app.use('/api/reminders', reminderRoutes);

// Admin routes (for testing/debugging)
app.use('/api/admin', adminRoutes);

// Global error handler middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    status: err.status,
  });
  
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
