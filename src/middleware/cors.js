const cors = require('cors');

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
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, check against whitelist
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];

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
