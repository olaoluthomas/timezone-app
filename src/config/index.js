/**
 * Centralized Configuration Management
 *
 * Provides type-safe, validated configuration for the entire application.
 * All environment variable access is centralized here.
 *
 * Benefits:
 * - Type safety (PORT is number, not string)
 * - Validation on startup (fail fast)
 * - Single source of truth
 * - Environment-specific helpers
 * - Self-documenting configuration
 *
 * Usage:
 *   const config = require('./config');
 *   const PORT = config.port;  // number
 *   if (config.isProduction) { ... }
 *
 * @module config
 */

/**
 * Configuration class with validation
 */
class Config {
  constructor() {
    // Environment
    this.nodeEnv = process.env.NODE_ENV || 'development';

    // Server
    this.port = this.parsePort(process.env.PORT);

    // Logging
    this.logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug');

    // CORS
    this.corsOrigin = process.env.CORS_ORIGIN || '*';
    this.allowedOrigins = this.parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

    // Geolocation API Key (optional - unlocks paid tier)
    this.geolocationApiKey = process.env.GEOLOCATION_API_KEY || null;

    // Validate configuration
    this.validate();
  }

  /**
   * Parse and validate PORT environment variable
   * @param {string|undefined} portStr - PORT environment variable
   * @returns {number} Valid port number
   */
  parsePort(portStr) {
    const defaultPort = 3000;
    if (!portStr) {
      return defaultPort;
    }

    const port = parseInt(portStr, 10);
    if (isNaN(port)) {
      console.warn(`Invalid PORT "${portStr}", using default ${defaultPort}`);
      return defaultPort;
    }

    return port;
  }

  /**
   * Parse ALLOWED_ORIGINS into array
   * @param {string|undefined} originsStr - Comma-separated origins
   * @returns {string[]} Array of allowed origins
   */
  parseAllowedOrigins(originsStr) {
    if (!originsStr) {
      return [];
    }

    return originsStr
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  /**
   * Validate configuration
   * @throws {Error} If configuration is invalid
   */
  validate() {
    // Validate PORT range
    if (this.port < 1 || this.port > 65535) {
      throw new Error(`Invalid PORT configuration: ${this.port}. Must be between 1 and 65535.`);
    }

    // Warn about unsafe CORS in production
    if (this.isProduction && this.corsOrigin === '*' && this.allowedOrigins.length === 0) {
      console.warn(
        'WARNING: CORS origin set to wildcard (*) in production with no ALLOWED_ORIGINS specified. ' +
          'Consider setting ALLOWED_ORIGINS for better security.'
      );
    }

    // Validate NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(this.nodeEnv)) {
      console.warn(
        `WARNING: NODE_ENV "${this.nodeEnv}" is not standard. ` +
          `Expected one of: ${validEnvs.join(', ')}`
      );
    }
  }

  /**
   * Check if running in production
   * @returns {boolean} True if NODE_ENV is 'production'
   */
  get isProduction() {
    return this.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean} True if NODE_ENV is 'development'
   */
  get isDevelopment() {
    return this.nodeEnv === 'development';
  }

  /**
   * Check if running in test
   * @returns {boolean} True if NODE_ENV is 'test'
   */
  get isTest() {
    return this.nodeEnv === 'test';
  }
}

// Export singleton instance
module.exports = new Config();
