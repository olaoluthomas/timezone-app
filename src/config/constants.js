/**
 * Application Constants
 *
 * Centralized configuration for timeouts, limits, and performance tuning.
 * All time values are in milliseconds unless otherwise noted.
 */

module.exports = {
  // ============================================
  // Request Timeouts
  // ============================================

  /**
   * Maximum time to wait for request completion
   * Prevents hung connections from consuming resources
   */
  REQUEST_TIMEOUT: 30 * 1000, // 30 seconds

  /**
   * Maximum time for health check operations
   * Must be fast to avoid blocking health probes
   */
  HEALTH_CHECK_TIMEOUT: 2 * 1000, // 2 seconds

  /**
   * Maximum time to wait for graceful shutdown
   * After this timeout, force shutdown occurs
   * Matches Kubernetes terminationGracePeriodSeconds default
   */
  GRACEFUL_SHUTDOWN_TIMEOUT: 30 * 1000, // 30 seconds

  // ============================================
  // Rate Limiting
  // ============================================

  /**
   * Time window for rate limit calculations
   * All rate limits reset after this period
   */
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes

  /**
   * Maximum API requests per window per IP
   * Protects against abuse while allowing normal usage
   */
  API_RATE_LIMIT: 100,

  /**
   * Maximum health check requests per window per IP
   * Higher than API to allow frequent monitoring
   */
  HEALTH_RATE_LIMIT: 300,

  // ============================================
  // Cache Configuration
  // ============================================

  /**
   * Default cache TTL (time-to-live)
   * Geolocation data is stable for 24 hours
   * Value in SECONDS (NodeCache requirement)
   */
  CACHE_TTL: 24 * 60 * 60, // 24 hours

  /**
   * How often to check for expired cache entries
   * Value in SECONDS (NodeCache requirement)
   */
  CACHE_CHECK_PERIOD: 60 * 60, // 1 hour

  /**
   * Maximum number of cache entries
   * Prevents unbounded memory growth
   * At ~2KB per entry: 10,000 keys ≈ 20MB
   */
  CACHE_MAX_KEYS: 10000,

  // ============================================
  // Request Limits
  // ============================================

  /**
   * Maximum request body size
   * Prevents large payload attacks
   */
  REQUEST_SIZE_LIMIT: '1kb',
};
