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
 * Returns development fallback data when API is unavailable
 * Only active in local development (NODE_ENV = 'development' or 'local')
 * NOT active in QA, staging, or production
 *
 * @returns {Object|null} Fallback data or null if not in local development
 */
function getDevFallback() {
  const currentEnv = process.env.NODE_ENV || 'development';

  // Only provide fallback in local development environments
  // QA, staging, and production should test real API behavior
  if (!DEV_FALLBACK_ENVIRONMENTS.includes(currentEnv)) {
    return null;
  }

  return DEV_FALLBACK_DATA;
}

/**
 * Normalize IP address from IPv6-mapped IPv4 format to pure IPv4
 * @param {string} ip - IP address (may be IPv4, IPv6, or IPv4-mapped IPv6)
 * @returns {string} Normalized IP address
 */
function normalizeIP(ip) {
  if (!ip) return ip;

  // Check if this is an IPv4-mapped IPv6 address (::ffff:x.x.x.x)
  if (ip.startsWith('::ffff:')) {
    // Extract the IPv4 part (everything after ::ffff:)
    return ip.substring(7);
  }

  return ip;
}

/**
 * Fetches timezone and location information based on IP address
 * Uses caching to reduce API calls and improve performance
 * @param {string} ip - The IP address to lookup
 * @returns {Promise<Object>} Location and timezone data
 */
async function getTimezoneByIP(ip) {
  try {
    // Normalize IPv6-mapped IPv4 addresses to pure IPv4
    // This handles ::ffff:192.168.1.1 → 192.168.1.1
    const normalizedIP = normalizeIP(ip);

    logger.debug('IP normalization', { originalIP: ip, normalizedIP });

    // Check if IP is localhost or private and should use server's public IP
    const isLocalhost =
      normalizedIP === '::1' || normalizedIP === '127.0.0.1' || normalizedIP?.startsWith('127.');

    const isPrivate =
      normalizedIP?.startsWith('10.') ||
      normalizedIP?.startsWith('192.168.') ||
      normalizedIP?.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

    // For localhost/private IPs, use empty string (server's public IP)
    const lookupIP = isLocalhost || isPrivate ? '' : normalizedIP;

    logger.debug('Geolocation lookup', {
      lookupIP: lookupIP || 'server public IP',
      isLocalhost,
      isPrivate,
    });

    // Create cache key from the lookup IP
    const cacheKey = `geo:${lookupIP || 'default'}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // Return cached data with fresh timestamp
      return {
        ...cachedData,
        timestamp: new Date().toISOString(),
        cached: true,
      };
    }

    // Cache miss - fetch from API
    const data = await fetchFromAPI(lookupIP);

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
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const localTime = formatter.format(now);

    return {
      ...cacheableData,
      currentTime: localTime,
      timestamp: now.toISOString(),
      cached: false,
    };
  } catch (error) {
    logger.error('Geolocation API error', { error: error.message, stack: error.stack });

    // In development, try fallback (works for any IP)
    const fallbackData = getDevFallback();
    if (fallbackData) {
      logger.warn('Using development fallback data', {
        reason: error.message,
        environment: process.env.NODE_ENV || 'not-set',
        originalIP: ip,
        fallback: true,
      });

      // Create cache key from the lookup IP (same as main flow)
      const normalizedIP = normalizeIP(ip);
      const isLocalhost =
        normalizedIP === '::1' || normalizedIP === '127.0.0.1' || normalizedIP?.startsWith('127.');
      const isPrivate =
        normalizedIP?.startsWith('10.') ||
        normalizedIP?.startsWith('192.168.') ||
        normalizedIP?.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
      const lookupIP = isLocalhost || isPrivate ? '' : normalizedIP;
      const cacheKey = `geo:${lookupIP || 'default'}`;

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
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: fallbackData.timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const localTime = formatter.format(now);

      return {
        ...cacheableData,
        currentTime: localTime,
        timestamp: now.toISOString(),
        cached: false,
        fallback: true, // Indicates fallback was used
      };
    }

    // Production: throw error as before
    throw new Error('Unable to determine location from IP address');
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
