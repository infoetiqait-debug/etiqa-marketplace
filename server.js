const express = require('express');
const config = require('./config');
const configureMiddleware = require('./middleware');
const configureRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

/**
 * Initialize Express application
 */
const app = express();

const startServer = async () => {
  let dbConnected = false;

  if (config.MONGO_URI) {
    const db = await connectDB();
    if (db) dbConnected = true;
  } else {
    console.warn('⚠️  MONGO_URI is not configured. Starting in demo mode without a database.');
  }

  app.locals.dbConnected = dbConnected;

  // Configure middleware (must be before routes)
  configureMiddleware(app);

  // Set up API routes
  configureRoutes(app);

  // Global error handler (must be last)
  app.use(errorHandler);

  /**
   * Start HTTP server
   */
  const server = app.listen(config.PORT, () => {
    console.log(`🚀 Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  });

  return server;
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

/**
 * Graceful shutdown handlers
 */
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };
