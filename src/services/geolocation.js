/**
 * Geolocation Service Module
 *
 * Provides IP-based geolocation and timezone detection with intelligent caching.
 *
 * Features:
 * - IP normalization (IPv6-mapped to IPv4)
 * - Localhost/private IP detection
 * - 24-hour caching (80-90% hit rate)
 * - Real-time timezone calculation
 * - Comprehensive location data
 * - Development fallback (prevents rate limiting in dev mode)
 *
 * Development Mode:
 * - Fallback to mock data on API errors (any IP address)
 * - Prevents rate limiting during local testing
 * - Logs clearly when fallback is used
 * - Only active when NODE_ENV = 'development' or 'local'
 * - Production behavior unchanged
 *
 * API Integration:
 * - Provider: ipapi.co
 * - Free Tier: 30,000 requests/month
 * - No API key required
 * - Response Time: 200-500ms (uncached)
 *
 * Cache Strategy:
 * - Key Format: "geo:{ip}" or "geo:default"
 * - TTL: 24 hours
 * - Effective Capacity: 150k-300k requests/month
 *
 * Response Format:
 * - IP address and location (city, region, country)
 * - Coordinates (latitude, longitude)
 * - Timezone and UTC offset
 * - Current time in local timezone
 * - Cache status flag
 * - Fallback flag (when using development fallback)
 *
 * @module services/geolocation
 */

const axios = require('axios');
const cache = require('./cache');
const logger = require('../utils/logger');
const config = require('../config');
const CONSTANTS = require('../config/constants');
const { determineLookupIP } = require('../utils/ip-validator');
const { formatTimezone } = require('../utils/date-formatter');

/**
 * Environment types where fallback should be active
 * Only local development environments - NOT staging, QA, or production
 * CI/CD pipelines should set NODE_ENV to:
 * - 'qa' or 'test' for QA environment
 * - 'staging' or 'stage' for staging environment
 * - 'production' for production environment
 */
const DEV_FALLBACK_ENVIRONMENTS = ['development', 'local'];

/**
 * Development fallback data for local testing
 * Used when running locally (NODE_ENV = 'development' or 'local') and API call fails
 * Prevents rate limiting issues during local development
 *
 * NOT used in:
 * - QA/Test environments (should test real API)
 * - Staging environments (should test production-like behavior)
 * - Production environments (must use real API)
 */
const DEV_FALLBACK_DATA = {
  ip: '127.0.0.1',
  city: 'San Francisco',
  region: 'California',
  country_name: 'United States',
  country_code: 'US',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
  utc_offset: '-08:00',
};

/**
 * Fetches timezone and location information from the API (uncached)
 * @param {string} lookupIP - The IP address to lookup
 * @returns {Promise<Object>} API response data
 */
async function fetchFromAPI(lookupIP) {
  const url = lookupIP ? `https://ipapi.co/${lookupIP}/json/` : 'https://ipapi.co/json/';

  const response = await axios.get(url);
  return response.data;
}

/**
 * Wraps fetchFromAPI with retry logic for 429 (rate limit) responses.
 * Uses exponential backoff and respects Retry-After headers.
 *
 * @param {string} lookupIP - The IP address to lookup
 * @returns {Promise<Object>} API response data
 * @throws {Error} With rateLimited=true if all retries exhausted on 429
 */
async function fetchWithRetry(lookupIP) {
  let lastError;

  for (let attempt = 0; attempt <= CONSTANTS.UPSTREAM_MAX_RETRIES; attempt++) {
    try {
      return await fetchFromAPI(lookupIP);
    } catch (error) {
      lastError = error;

      const is429 = error.response && error.response.status === 429;
      if (!is429 || attempt === CONSTANTS.UPSTREAM_MAX_RETRIES) {
        break;
      }

      const retryAfter = error.response.headers?.['retry-after'];
      const delay = retryAfter
        ? Math.min(parseInt(retryAfter, 10) * 1000, 10000)
        : CONSTANTS.UPSTREAM_BASE_DELAY * Math.pow(2, attempt);

      logger.warn('ipapi.co rate limited, retrying', {
        attempt: attempt + 1,
        maxRetries: CONSTANTS.UPSTREAM_MAX_RETRIES,
        delayMs: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Tag rate-limit errors so route handler can return 503
  if (lastError.response && lastError.response.status === 429) {
    const rateLimitError = new Error('Upstream geolocation API rate limited');
    rateLimitError.rateLimited = true;
    rateLimitError.cause = lastError;
    throw rateLimitError;
  }

  throw lastError;
}

/**
 * Returns development fallback data when API is unavailable
 * Only active in local development (NODE_ENV = 'development' or 'local')
 * NOT active in QA, staging, or production
 *
 * @returns {Object|null} Fallback data or null if not in local development
 */
function getDevFallback() {
  const currentEnv = config.nodeEnv;

  // Only provide fallback in local development environments
  // QA, staging, and production should test real API behavior
  if (!DEV_FALLBACK_ENVIRONMENTS.includes(currentEnv)) {
    return null;
  }

  return DEV_FALLBACK_DATA;
}

/**
 * Fetches timezone and location information based on IP address
 * Uses caching to reduce API calls and improve performance
 * @param {string} ip - The IP address to lookup
 * @returns {Promise<Object>} Location and timezone data
 */
async function getTimezoneByIP(ip) {
  try {
    // Determine lookup IP (handles normalization and localhost/private detection)
    const ipInfo = determineLookupIP(ip);

    logger.debug('IP normalization', {
      originalIP: ip,
      normalizedIP: ipInfo.normalizedIP,
    });

    logger.debug('Geolocation lookup', {
      lookupIP: ipInfo.lookupIP || 'server public IP',
      isLocalhost: ipInfo.isLocalhost,
      isPrivate: ipInfo.isPrivate,
    });

    // Create cache key from the lookup IP
    const cacheKey = `geo:${ipInfo.lookupIP || 'default'}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // Recalculate current time from cached timezone (time changes between requests)
      const localTime = formatTimezone(cachedData.timezone);

      return {
        ...cachedData,
        currentTime: localTime,
        timestamp: new Date().toISOString(),
        cached: true,
      };
    }

    // Cache miss - fetch from API (with retry for rate limiting)
    const data = await fetchWithRetry(ipInfo.lookupIP);

    // Store base data in cache (without timestamp to avoid staleness)
    const cacheableData = {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      utcOffset: data.utc_offset,
    };
    cache.set(cacheKey, cacheableData);

    // Calculate current time in the detected timezone
    const localTime = formatTimezone(data.timezone);

    return {
      ...cacheableData,
      currentTime: localTime,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  } catch (error) {
    logger.error('Geolocation API error', { error: error.message, stack: error.stack });

    // Rate-limit errors should propagate directly so the route handler returns 503
    if (error.rateLimited) {
      throw error;
    }

    // In development, try fallback (works for any IP)
    const fallbackData = getDevFallback();
    if (fallbackData) {
      logger.warn('Using development fallback data', {
        reason: error.message,
        environment: config.nodeEnv,
        originalIP: ip,
        fallback: true,
      });

      // Determine lookup IP (same as main flow)
      const ipInfo = determineLookupIP(ip);
      const cacheKey = `geo:${ipInfo.lookupIP || 'default'}`;

      // Cache the fallback data (same as normal response)
      const cacheableData = {
        ip: fallbackData.ip,
        city: fallbackData.city,
        region: fallbackData.region,
        country: fallbackData.country_name,
        countryCode: fallbackData.country_code,
        latitude: fallbackData.latitude,
        longitude: fallbackData.longitude,
        timezone: fallbackData.timezone,
        utcOffset: fallbackData.utc_offset,
      };
      cache.set(cacheKey, cacheableData);

      // Calculate current time in fallback timezone
      const localTime = formatTimezone(fallbackData.timezone);

      return {
        ...cacheableData,
        currentTime: localTime,
        timestamp: new Date().toISOString(),
        cached: false,
        fallback: true, // Indicates fallback was used
      };
    }

    // Production: throw error as before
    throw new Error('Unable to determine location from IP address', { cause: error });
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  return cache.getStats();
}

/**
 * Clear the geolocation cache
 */
function clearCache() {
  cache.flush();
}

module.exports = {
  getTimezoneByIP,
  getCacheStats,
  clearCache,
};
