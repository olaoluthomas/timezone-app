/**
 * Express Application Configuration
 *
 * Configures the Express.js application with:
 * - Security middleware (Helmet, CORS, rate limiting)
 * - Request parsing and timeout handling
 * - Health check endpoints (liveness and readiness probes)
 * - Main API endpoint for timezone lookup
 * - Static file serving
 *
 * Middleware Stack (in order):
 * 1. Trust proxy (for accurate IP extraction)
 * 2. Helmet (security headers)
 * 3. Request/response logger (request tracing)
 * 4. Compression (gzip for responses >1KB)
 * 5. CORS (cross-origin resource sharing)
 * 6. JSON parser (1KB limit)
 * 7. Request timeout (30 seconds)
 * 8. Static files (no rate limiting)
 * 9. Health endpoints (lenient rate limiting)
 * 10. API endpoints (strict rate limiting)
 *
 * @module app
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compressionMiddleware = require('./middleware/compression');
const corsMiddleware = require('./middleware/cors');
const { apiLimiter, healthLimiter } = require('./middleware/rate-limit');
const timeoutMiddleware = require('./middleware/timeout');
const requestLogger = require('./middleware/request-logger');
const geolocationService = require('./services/geolocation');
const healthService = require('./services/health');
const logger = require('./utils/logger');
const CONSTANTS = require('./config/constants');

const app = express();

// Trust proxy to properly parse X-Forwarded-For headers
// Set to 1 to trust only the first proxy (more secure than 'true')
// Required for rate limiting and IP-based features behind proxies/load balancers
app.set('trust proxy', 1);

// 1. Security headers (first)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline scripts for frontend
    crossOriginEmbedderPolicy: false, // Allow cross-origin resources
    crossOriginOpenerPolicy: false, // Avoid COOP warning on HTTP origins
  })
);

// 2. Request/response logging (early for complete request tracing)
app.use(requestLogger);

// 3. Compression (before CORS for optimal performance)
app.use(compressionMiddleware);

// 4. CORS (before routes)
app.use(corsMiddleware);

// 5. Request parsing with limits
app.use(
  express.json({
    limit: CONSTANTS.REQUEST_SIZE_LIMIT, // Timezone API doesn't need large payloads
  })
);

// 6. Request timeout (30 seconds)
app.use(timeoutMiddleware(CONSTANTS.REQUEST_TIMEOUT));

// 7. Static files (no rate limiting)
app.use(express.static(path.join(__dirname, 'public')));

// 8. Health check endpoints with lenient rate limiting
app.get('/health', healthLimiter, (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/ready', healthLimiter, async (req, res) => {
  try {
    const healthStatus = await healthService.performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message,
    });
  }
});

// 9. API routes with strict rate limiting
app.get('/api/timezone', apiLimiter, async (req, res) => {
  // Handle socket timeout: send 503 instead of letting the socket be destroyed.
  // Without this listener, Node.js auto-destroys the socket after REQUEST_TIMEOUT,
  // causing clients to receive a "socket hang up" rather than a proper error response.
  res.on('timeout', () => {
    if (!res.headersSent) {
      res.status(503).set('Retry-After', '60').json({
        error: 'Geolocation service temporarily unavailable',
      });
    }
  });

  try {
    // Get client IP - trust proxy setting handles X-Forwarded-For parsing
    // req.ip is automatically parsed by Express when trust proxy is enabled
    const clientIP = req.ip;

    const timezoneInfo = await geolocationService.getTimezoneByIP(clientIP);
    res.json(timezoneInfo);
  } catch (error) {
    logger.error('Timezone API error', { error: error.message, ip: req.ip });
    if (error.rateLimited) {
      res.status(503).set('Retry-After', '60').json({
        error: 'Geolocation service temporarily unavailable',
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch timezone information' });
    }
  }
});

module.exports = app;
// Test PR issue closing validation - Test 1: issue-N format
