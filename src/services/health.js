const axios = require('axios');
const cache = require('./cache');

/**
 * Check if external geolocation API is accessible
 * @returns {Promise<Object>} Health check result
 */
async function checkGeolocationAPI() {
  try {
    const startTime = Date.now();

    // Use a lightweight endpoint check (not full geolocation)
    // Just verify the API is reachable
    await axios.get('https://ipapi.co/json/', {
      timeout: 2000, // 2 second timeout
      validateStatus: (status) => status < 500, // Accept 4xx as "API is up"
    });

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      message: 'Geolocation API is accessible',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      message: `Geolocation API error: ${error.message}`,
      error: error.code || 'UNKNOWN',
    };
  }
}

/**
 * Check if cache service is operational
 * @returns {Object} Cache health status
 */
function checkCache() {
  try {
    const stats = cache.getStats();
    return {
      status: 'healthy',
      keys: stats.keys,
      hitRate: stats.hitRate,
      message: 'Cache is operational',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Cache error: ${error.message}`,
    };
  }
}

/**
 * Perform comprehensive health check
 * @returns {Promise<Object>} Complete health status
 */
async function performHealthCheck() {
  const startTime = Date.now();

  // Run checks in parallel for speed
  const [apiCheck, cacheCheck] = await Promise.all([
    checkGeolocationAPI(),
    Promise.resolve(checkCache()),
  ]);

  const totalTime = Date.now() - startTime;

  // Determine overall health
  const isHealthy = apiCheck.status === 'healthy' && cacheCheck.status === 'healthy';

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      geolocationAPI: apiCheck,
      cache: cacheCheck,
    },
    responseTime: `${totalTime}ms`,
  };
}

module.exports = {
  checkGeolocationAPI,
  checkCache,
  performHealthCheck,
};
