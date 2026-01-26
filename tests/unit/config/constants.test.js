const CONSTANTS = require('../../../src/config/constants');

describe('Constants', () => {
  describe('Timeouts', () => {
    it('should have reasonable request timeout', () => {
      expect(CONSTANTS.REQUEST_TIMEOUT).toBe(30000);
      expect(CONSTANTS.REQUEST_TIMEOUT).toBeGreaterThan(0);
    });

    it('should have fast health check timeout', () => {
      expect(CONSTANTS.HEALTH_CHECK_TIMEOUT).toBe(2000);
      expect(CONSTANTS.HEALTH_CHECK_TIMEOUT).toBeLessThan(CONSTANTS.REQUEST_TIMEOUT);
    });
  });

  describe('Rate Limits', () => {
    it('should have consistent rate limit window', () => {
      expect(CONSTANTS.RATE_LIMIT_WINDOW).toBe(15 * 60 * 1000);
    });

    it('should have higher health rate limit than API', () => {
      expect(CONSTANTS.HEALTH_RATE_LIMIT).toBe(300);
      expect(CONSTANTS.API_RATE_LIMIT).toBe(100);
      expect(CONSTANTS.HEALTH_RATE_LIMIT).toBeGreaterThan(CONSTANTS.API_RATE_LIMIT);
    });

    it('should have positive rate limits', () => {
      expect(CONSTANTS.API_RATE_LIMIT).toBeGreaterThan(0);
      expect(CONSTANTS.HEALTH_RATE_LIMIT).toBeGreaterThan(0);
    });

    it('should have reasonable rate limit window', () => {
      expect(CONSTANTS.RATE_LIMIT_WINDOW).toBeGreaterThan(0);
      expect(CONSTANTS.RATE_LIMIT_WINDOW).toBeLessThanOrEqual(60 * 60 * 1000); // <= 1 hour
    });
  });

  describe('Cache Configuration', () => {
    it('should have 24-hour cache TTL', () => {
      expect(CONSTANTS.CACHE_TTL).toBe(86400); // seconds
    });

    it('should check cache hourly', () => {
      expect(CONSTANTS.CACHE_CHECK_PERIOD).toBe(3600); // seconds
    });

    it('should limit cache size', () => {
      expect(CONSTANTS.CACHE_MAX_KEYS).toBe(10000);
    });

    it('should have reasonable cache configuration', () => {
      expect(CONSTANTS.CACHE_TTL).toBeGreaterThan(0);
      expect(CONSTANTS.CACHE_CHECK_PERIOD).toBeGreaterThan(0);
      expect(CONSTANTS.CACHE_MAX_KEYS).toBeGreaterThan(0);
      // Check period should be less than TTL
      expect(CONSTANTS.CACHE_CHECK_PERIOD).toBeLessThan(CONSTANTS.CACHE_TTL);
    });
  });

  describe('Request Limits', () => {
    it('should have request size limit', () => {
      expect(CONSTANTS.REQUEST_SIZE_LIMIT).toBe('1kb');
    });

    it('should have valid size limit format', () => {
      expect(typeof CONSTANTS.REQUEST_SIZE_LIMIT).toBe('string');
      expect(CONSTANTS.REQUEST_SIZE_LIMIT).toMatch(/^\d+[kmg]b$/i);
    });
  });

  describe('Type Safety', () => {
    it('should have all timeout values as numbers', () => {
      expect(typeof CONSTANTS.REQUEST_TIMEOUT).toBe('number');
      expect(typeof CONSTANTS.HEALTH_CHECK_TIMEOUT).toBe('number');
    });

    it('should have all rate limit values as numbers', () => {
      expect(typeof CONSTANTS.RATE_LIMIT_WINDOW).toBe('number');
      expect(typeof CONSTANTS.API_RATE_LIMIT).toBe('number');
      expect(typeof CONSTANTS.HEALTH_RATE_LIMIT).toBe('number');
    });

    it('should have all cache values as numbers', () => {
      expect(typeof CONSTANTS.CACHE_TTL).toBe('number');
      expect(typeof CONSTANTS.CACHE_CHECK_PERIOD).toBe('number');
      expect(typeof CONSTANTS.CACHE_MAX_KEYS).toBe('number');
    });

    it('should have request size limit as string', () => {
      expect(typeof CONSTANTS.REQUEST_SIZE_LIMIT).toBe('string');
    });
  });
});
