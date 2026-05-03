const geolocationService = require('../services/geolocation');
const logger = require('../utils/logger');

async function getTimezone(req, res, next) {
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
    if (!res.headersSent) {
      res.json(timezoneInfo);
    }
  } catch (error) {
    if (res.headersSent) return;
    logger.error('Timezone API error', { error: error.message, ip: req.ip });
    if (error.rateLimited) {
      res.status(503).set('Retry-After', '60').json({
        error: 'Geolocation service temporarily unavailable',
      });
    } else {
      next(error);
    }
  }
}

module.exports = { getTimezone };
