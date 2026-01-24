const express = require('express');
const path = require('path');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const { apiLimiter, healthLimiter } = require('./middleware/rate-limit');
const timeoutMiddleware = require('./middleware/timeout');
const geolocationService = require('./services/geolocation');
const healthService = require('./services/health');

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
  })
);

// 2. CORS (before routes)
app.use(corsMiddleware);

// 3. Request parsing with limits
app.use(
  express.json({
    limit: '1kb', // Timezone API doesn't need large payloads
  })
);

// 4. Request timeout (30 seconds)
app.use(timeoutMiddleware(30000));

// 5. Static files (no rate limiting)
app.use(express.static(path.join(__dirname, 'public')));

// 6. Health check endpoints with lenient rate limiting
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

// 7. API routes with strict rate limiting
app.get('/api/timezone', apiLimiter, async (req, res) => {
  try {
    // Get client IP - trust proxy setting handles X-Forwarded-For parsing
    // req.ip is automatically parsed by Express when trust proxy is enabled
    const clientIP = req.ip;

    const timezoneInfo = await geolocationService.getTimezoneByIP(clientIP);
    res.json(timezoneInfo);
  } catch (error) {
    console.error('Error fetching timezone:', error);
    res.status(500).json({ error: 'Failed to fetch timezone information' });
  }
});

module.exports = app;
