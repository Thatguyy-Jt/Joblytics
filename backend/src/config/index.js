import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the environment schema using Zod
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT Secrets
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookie Settings
  COOKIE_SECURE: z.string().transform((val) => val === 'true').default('false'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().default(''),

  // OpenAI API
  // Required when AI_MODE is 'live', optional when 'mock'
  OPENAI_API_KEY: z.string().optional(),
  // AI Mode: 'mock' for development (no OpenAI calls), 'live' for production (uses OpenAI)
  AI_MODE: z.enum(['mock', 'live']).default('mock'),

  // Email Configuration
  EMAIL_FROM: z.string().email().default('noreply@joblytics.com'),
  EMAIL_FROM_NAME: z.string().default('Joblytics'),
  EMAIL_SERVICE: z.enum(['smtp', 'resend', 'sendgrid', 'stub']).default('stub'),
  // SMTP Configuration (when EMAIL_SERVICE='smtp')
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_SECURE: z.string().transform((val) => val === 'true').default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Resend API Key (when EMAIL_SERVICE='resend')
  RESEND_API_KEY: z.string().optional(),
  // SendGrid API Key (when EMAIL_SERVICE='sendgrid')
  SENDGRID_API_KEY: z.string().optional(),

  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

/**
 * Validates and returns the environment configuration
 * Throws an error if required variables are missing or invalid
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional validation: OPENAI_API_KEY required only when AI_MODE is 'live'
    if (parsed.AI_MODE === 'live' && (!parsed.OPENAI_API_KEY || parsed.OPENAI_API_KEY.trim() === '')) {
      console.error('❌ Environment validation failed:');
      console.error('OPENAI_API_KEY is required when AI_MODE is "live"');
      console.error('Either set OPENAI_API_KEY in your .env file or set AI_MODE=mock');
      process.exit(1);
    }
    
    // Additional validation: Email service configuration
    if (parsed.EMAIL_SERVICE === 'smtp') {
      if (!parsed.SMTP_HOST || !parsed.SMTP_PORT || !parsed.SMTP_USER || !parsed.SMTP_PASS) {
        console.error('❌ Environment validation failed:');
        console.error('SMTP configuration is required when EMAIL_SERVICE is "smtp"');
        console.error('Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS');
        process.exit(1);
      }
    } else if (parsed.EMAIL_SERVICE === 'resend' && (!parsed.RESEND_API_KEY || parsed.RESEND_API_KEY.trim() === '')) {
      console.error('❌ Environment validation failed:');
      console.error('RESEND_API_KEY is required when EMAIL_SERVICE is "resend"');
      process.exit(1);
    } else if (parsed.EMAIL_SERVICE === 'sendgrid' && (!parsed.SENDGRID_API_KEY || parsed.SENDGRID_API_KEY.trim() === '')) {
      console.error('❌ Environment validation failed:');
      console.error('SENDGRID_API_KEY is required when EMAIL_SERVICE is "sendgrid"');
      process.exit(1);
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment validation failed:');
      console.error('Missing or invalid environment variables:');
      missingVars.forEach((msg) => console.error(`  - ${msg}`));
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
    throw error;
  }
}

// Validate and export the config
const config = validateEnv();

export default config;

