/**
 * CORS Middleware Configuration
 *
 * Provides Cross-Origin Resource Sharing (CORS) configuration with
 * environment-based origin validation.
 *
 * Development Mode:
 * - Allows all origins
 * - Enables rapid local testing
 *
 * Production Mode:
 * - Validates origins against ALLOWED_ORIGINS env variable
 * - Comma-separated whitelist
 * - Rejects unauthorized origins with CORS error
 *
 * Configuration:
 * - Methods: GET, OPTIONS (read-only API)
 * - Credentials: Disabled (no auth)
 * - Max Age: 24 hours (cache preflight)
 *
 * @module middleware/cors
 */

const cors = require('cors');
const config = require('../config');

/**
 * CORS middleware with environment-based configuration
 * - Development: Allow all origins
 * - Production: Whitelist specific domains
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In non-production environments (development, test), allow all origins
    if (!config.isProduction) {
      return callback(null, true);
    }

    // In production, check against whitelist
    const allowedOrigins = config.allowedOrigins;

    // Allow if origin is in whitelist or whitelist includes '*'
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'OPTIONS'], // Read-only API
  allowedHeaders: ['Content-Type'],
  credentials: false, // No cookies or authentication
  maxAge: 86400, // Cache preflight response for 24 hours
};

module.exports = cors(corsOptions);
