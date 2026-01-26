/**
 * Winston Logger Configuration
 *
 * Provides structured logging with multiple transports and log levels.
 *
 * Log Levels (in order of priority):
 * - error: Error messages that need immediate attention
 * - warn: Warning messages for potentially harmful situations
 * - info: Informational messages about application progress
 * - debug: Detailed debug information (development only)
 *
 * Transports:
 * - Console: All environments (formatted for readability)
 * - File (error.log): Error-level logs only
 * - File (combined.log): All logs
 * - Daily Rotate (daily-logs/): Rotated logs with 14-day retention
 *
 * Environment Behavior:
 * - Production: info level, JSON format
 * - Development/Test: debug level, pretty format
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 3000 });
 *   logger.error('API error', { error: err.message, ip: req.ip });
 *   logger.debug('Cache hit', { key: 'geo:127.0.0.1' });
 *
 * @module utils/logger
 */

const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Determine log level based on environment
const logLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Define custom format for development (pretty print)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Define format for production (JSON)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Choose format based on environment
const logFormat = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Create transports array
const transports = [
  // Console transport (all environments)
  new winston.transports.Console({
    format: logFormat,
  }),
];

// Add file transports only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Error log file (errors only)
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: prodFormat,
    })
  );

  // Combined log file (all levels)
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: prodFormat,
    })
  );

  // Daily rotating file (production-ready log rotation)
  // Only add if DailyRotateFile is available and properly configured
  try {
    transports.push(
      new DailyRotateFile({
        dirname: path.join(process.cwd(), 'logs', 'daily'),
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d', // Keep logs for 14 days
        format: prodFormat,
      })
    );
  } catch (_error) {
    // DailyRotateFile may not be available in some environments
    // Fallback to standard file transport is sufficient
    console.warn('DailyRotateFile transport not available, using standard file transports');
  }
}

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  transports,
  // Exit on error: false (don't exit on uncaught exceptions)
  exitOnError: false,
});

// Add stream for Morgan HTTP logger integration (if needed later)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

/**
 * Create a child logger with default metadata
 * @param {Object} defaultMeta - Default metadata to include in all logs
 * @returns {Object} Child logger instance
 */
logger.child = function (defaultMeta) {
  return winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
    ),
    defaultMeta,
    transports,
  });
};

module.exports = logger;
