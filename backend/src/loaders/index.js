import config from '../config/index.js';
import { connectDB } from './mongoose.js';
import app from '../app.js';

/**
 * Central loader that initializes the entire application
 * 
 * Order of initialization:
 * 1. Environment config (validated on import)
 * 2. MongoDB connection
 * 3. Express app setup (already configured)
 * 
 * @returns {Promise<Express>} Initialized Express application
 * @throws {Error} If MongoDB connection fails
 */
async function loadApp() {
  try {
    // 1. Environment config is automatically validated when imported
    // If validation fails, the process exits with error messages
    console.log('✅ Environment configuration loaded');
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Port: ${config.PORT}`);

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Express app is already configured with middleware
    // (JSON parsing, CORS, cookie parsing)
    console.log('✅ Express app configured');

    // 4. Log AI mode configuration
    const aiMode = process.env.AI_MODE || 'mock';
    if (aiMode === 'mock') {
      console.log('🤖 AI Mode: MOCK (using mock responses, no OpenAI calls)');
    } else {
      console.log('🤖 AI Mode: LIVE (using OpenAI API)');
    }

    return app;
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    throw error;
  }
}

export default loadApp;

