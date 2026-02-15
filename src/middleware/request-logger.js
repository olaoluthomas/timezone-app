/**
 * Request/Response Logging Middleware
 *
 * Automatically logs all incoming HTTP requests and their responses with:
 * - Request details: method, URL, IP address, user agent
 * - Response details: status code, duration
 * - Appropriate log levels based on response status
 *
 * Log Levels:
 * - info: Successful responses (2xx, 3xx)
 * - warn: Client errors (4xx)
 * - error: Server errors (5xx)
 *
 * Benefits:
 * - Complete request tracing in production
 * - Automatic performance monitoring per request
 * - Better production debugging
 * - Correlate logs with specific requests
 *
 * Usage:
 *   const requestLogger = require('./middleware/request-logger');
 *   app.use(requestLogger);
 *
 * @module middleware/request-logger
 */

const logger = require('../utils/logger');

/**
 * Request/response logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;

    // Determine log level based on status code
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    // Log completed request
    logger[logLevel]('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
}

module.exports = requestLogger;
