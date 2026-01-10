import mongoose from 'mongoose';
import config from '../config/index.js';

/**
 * Connects to MongoDB using Mongoose
 * Handles connection errors and logs success
 */
async function connectDB() {
  try {
    const options = {
      // Use new URL parser and unified topology (default in Mongoose 6+)
      // These options are handled automatically in newer versions
    };

    await mongoose.connect(config.MONGODB_URI, options);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Log successful connection
    console.log(`✅ MongoDB connected successfully`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(`   Error: ${error.message}`);
    console.error(`   URI: ${config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
    throw error;
  }
}

/**
 * Gracefully closes MongoDB connection
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
    throw error;
  }
}

export { connectDB, disconnectDB };

