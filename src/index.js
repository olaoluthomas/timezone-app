/**
 * Server Entry Point
 *
 * Starts the Express application and listens on the configured port.
 * This is the main entry point for the application in production and development.
 *
 * Implements graceful shutdown handling for zero-downtime deployments:
 * - SIGTERM/SIGINT signal handling
 * - In-flight request completion
 * - Resource cleanup (cache flush)
 * - 30-second timeout for forced shutdown
 * - Comprehensive error handling
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 *
 * @module index
 */

const app = require('./app');
const logger = require('./utils/logger');
const cache = require('./services/cache');
const CONSTANTS = require('./config/constants');
const config = require('./config');

const PORT = config.port;

/**
 * Graceful shutdown handler
 *
 * Performs orderly shutdown:
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete
 * 3. Flush cache
 * 4. Exit with appropriate code
 *
 * @param {Object} server - HTTP server instance
 * @param {string} signal - Signal name (SIGTERM, SIGINT, etc.)
 */
function gracefulShutdown(server, signal) {
  logger.info('Shutdown signal received', { signal });

  // Set timeout for forced shutdown after 30 seconds
  const forceShutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded, forcing shutdown', {
      timeout: CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT,
      signal,
    });
    process.exit(1);
  }, CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT);

  // Prevent timeout from keeping process alive
  forceShutdownTimeout.unref();

  // Close server to stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown', {
        error: err.message,
        stack: err.stack,
        signal,
      });
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }

    logger.info('HTTP server closed successfully', { signal });

    // Cleanup resources
    try {
      cache.flush();
      logger.info('Cache flushed successfully');
    } catch (cacheError) {
      logger.error('Error flushing cache', {
        error: cacheError.message,
        signal,
      });
    }

    // Successful shutdown
    logger.info('Graceful shutdown completed', { signal });
    clearTimeout(forceShutdownTimeout);
    process.exit(0);
  });
}

// Only start server if this is the main module (not being required for tests)
if (require.main === module) {
  // Store server instance for graceful shutdown
  const server = app.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      url: `http://localhost:${PORT}`,
      environment: config.nodeEnv,
    });
  });

  // Signal handlers
  process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

  // Error handlers
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception detected', {
      error: err.message,
      stack: err.stack,
    });
    gracefulShutdown(server, 'UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: String(promise),
    });
    gracefulShutdown(server, 'UNHANDLED_REJECTION');
  });
}

// Export for testing
module.exports = { gracefulShutdown };
