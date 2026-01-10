import http from 'http';
import config from './config/index.js';
import loadApp from './loaders/index.js';
import { disconnectDB } from './loaders/mongoose.js';
import reminderProcessor from './jobs/reminder.processor.js';

/**
 * Server entry point
 * Initializes the application and starts the HTTP server
 */
async function startServer() {
  try {
    // Initialize the application (config, MongoDB, Express app)
    const app = await loadApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening on configured port
    server.listen(config.PORT, () => {
      console.log(`🚀 Server is running on port ${config.PORT}`);
      console.log(`   Environment: ${config.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${config.PORT}/health`);
      
      // Start reminder processor (background job scheduler)
      reminderProcessor.start();
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Stop reminder processor
      reminderProcessor.stop();

      // Stop accepting new connections
      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          // Close MongoDB connection
          await disconnectDB();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error.message);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
