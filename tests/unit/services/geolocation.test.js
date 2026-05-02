const nock = require('nock');
const { getTimezoneByIP, getCacheStats, clearCache } = require('../../../src/services/geolocation');
const {
  MOCK_RESPONSES,
  mockGeolocationSuccess,
  mockGeolocationError,
  mockGeolocationRateLimit,
  mockGeolocationNetworkError,
} = require('../../helpers/nock-mocks');
const { setupGeolocationTests } = require('../../helpers/test-setup');

describe('GeolocationService', () => {
  setupGeolocationTests(clearCache);

  describe('getTimezoneByIP', () => {
    test('should fetch timezone data for valid IP', async () => {
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('8.8.8.8');

      expect(result).toHaveProperty('ip', '8.8.8.8');
      expect(result).toHaveProperty('city', 'Mountain View');
      expect(result).toHaveProperty('region', 'California');
      expect(result).toHaveProperty('country', 'United States');
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
      expect(result).toHaveProperty('currentTime');
      expect(result).toHaveProperty('timestamp');
      expect(result.cached).toBe(false);
    });

    test('should handle localhost IP (127.0.0.1)', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('127.0.0.1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should handle IPv6 localhost (::1)', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should handle ::ffff:127.x.x.x format', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::ffff:127.0.0.1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should throw error on API failure', async () => {
      mockGeolocationError('8.8.8.8', 500, { error: 'Internal Server Error' });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should throw error on network timeout', async () => {
      mockGeolocationNetworkError('8.8.8.8', 'ETIMEDOUT');

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should not retry on non-429 errors (e.g., 500)', async () => {
      // Only one nock interceptor — if a retry happened, nock would throw
      mockGeolocationError('8.8.8.8', 500, { error: 'Server Error' });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should include all required fields in response', async () => {
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('8.8.8.8');

      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('region');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('countryCode');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('utcOffset');
      expect(result).toHaveProperty('currentTime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('cached');
    });
  });

  describe('caching behavior', () => {
    test('should cache IP lookup results', async () => {
      mockGeolocationSuccess('8.8.8.8');

      // First call - should hit API
      const result1 = await getTimezoneByIP('8.8.8.8');
      expect(result1.cached).toBe(false);

      // Second call - should hit cache (no new nock setup needed)
      const result2 = await getTimezoneByIP('8.8.8.8');
      expect(result2.cached).toBe(true);
      expect(result2.ip).toBe(result1.ip);
      expect(result2.city).toBe(result1.city);
    });

    test('should have different timestamps for cached calls', async () => {
      mockGeolocationSuccess('8.8.8.8');

      const result1 = await getTimezoneByIP('8.8.8.8');

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = await getTimezoneByIP('8.8.8.8');

      expect(result2.cached).toBe(true);
      expect(result2.timestamp).not.toBe(result1.timestamp);
    });

    test('should include currentTime on cache hits', async () => {
      mockGeolocationSuccess('8.8.8.8');

      // First call - cache miss
      const result1 = await getTimezoneByIP('8.8.8.8');
      expect(result1.cached).toBe(false);
      expect(result1.currentTime).toBeDefined();

      // Second call - cache hit should also have currentTime
      const result2 = await getTimezoneByIP('8.8.8.8');
      expect(result2.cached).toBe(true);
      expect(result2.currentTime).toBeDefined();
    });

    test('should cache different IPs separately', async () => {
      mockGeolocationSuccess('8.8.8.8');
      mockGeolocationSuccess('1.1.1.1', {
        ...MOCK_RESPONSES.SUCCESS,
        ip: '1.1.1.1',
        city: 'Los Angeles',
      });

      const result1 = await getTimezoneByIP('8.8.8.8');
      const result2 = await getTimezoneByIP('1.1.1.1');

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
      expect(result1.ip).toBe('8.8.8.8');
      expect(result2.ip).toBe('1.1.1.1');

      // Both should now be cached
      const result3 = await getTimezoneByIP('8.8.8.8');
      const result4 = await getTimezoneByIP('1.1.1.1');

      expect(result3.cached).toBe(true);
      expect(result4.cached).toBe(true);
    });
  });

  describe('getCacheStats', () => {
    test('should return cache statistics', async () => {
      mockGeolocationSuccess('8.8.8.8');

      await getTimezoneByIP('8.8.8.8');
      await getTimezoneByIP('8.8.8.8'); // cached

      const stats = getCacheStats();

      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    test('should clear cached entries', async () => {
      mockGeolocationSuccess('8.8.8.8', MOCK_RESPONSES.SUCCESS, { times: 2 });

      // First call
      await getTimezoneByIP('8.8.8.8');

      // Second call should be cached
      const result2 = await getTimezoneByIP('8.8.8.8');
      expect(result2.cached).toBe(true);

      // Clear cache
      clearCache();

      // Third call should hit API again
      const result3 = await getTimezoneByIP('8.8.8.8');
      expect(result3.cached).toBe(false);
    });
  });

  describe('IP normalization', () => {
    test('should handle IPv6-mapped IPv4 localhost', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::ffff:127.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (192.168.x.x)', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::ffff:192.168.1.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (10.x.x.x)', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::ffff:10.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (172.16-31.x.x)', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::ffff:172.16.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle pure IPv6 localhost', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('::1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle pure IPv4 localhost', async () => {
      mockGeolocationSuccess(null);

      const result = await getTimezoneByIP('127.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped public IPs', async () => {
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('::ffff:8.8.8.8');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should normalize and use IPv4 for IPv6-mapped public IP', async () => {
      // When we pass ::ffff:8.8.8.8, it should normalize to 8.8.8.8
      // and make the API call with the pure IPv4 address
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('::ffff:8.8.8.8');
      expect(result).toHaveProperty('ip', '8.8.8.8');
      expect(result.cached).toBe(false);
    });
  });

  describe('upstream retry on 429', () => {
    let CONSTANTS;

    beforeEach(() => {
      clearCache();
      nock.cleanAll();
      // Use minimal delays for fast tests
      CONSTANTS = require('../../../src/config/constants');
      CONSTANTS.UPSTREAM_BASE_DELAY = 10; // 10ms instead of 1s
      CONSTANTS.UPSTREAM_MAX_RETRIES = 3;
    });

    afterEach(() => {
      // Restore original values
      CONSTANTS.UPSTREAM_BASE_DELAY = 1000;
    });

    test('should retry on 429 and succeed on subsequent attempt', async () => {
      mockGeolocationRateLimit('8.8.8.8');
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('8.8.8.8');

      expect(result).toHaveProperty('ip', '8.8.8.8');
      expect(result).toHaveProperty('city', 'Mountain View');
      expect(result.cached).toBe(false);
    });

    test('should retry up to max retries on persistent 429', async () => {
      // 1 initial + 3 retries = 4 total requests
      mockGeolocationRateLimit('8.8.8.8', { times: 4 });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Upstream geolocation API rate limited'
      );
    });

    test('should set rateLimited flag on persistent 429', async () => {
      mockGeolocationRateLimit('8.8.8.8', { times: 4 });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toMatchObject({
        rateLimited: true,
      });
    });

    test('should respect Retry-After header', async () => {
      CONSTANTS.UPSTREAM_BASE_DELAY = 10;

      mockGeolocationRateLimit('8.8.8.8', { retryAfter: 1 });
      mockGeolocationSuccess('8.8.8.8');

      const result = await getTimezoneByIP('8.8.8.8');
      expect(result).toHaveProperty('ip', '8.8.8.8');
    }, 10000);
  });

  describe('development fallback', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      // Clear module cache after restoring NODE_ENV
      jest.resetModules();
    });

    test('should use fallback data for localhost when API fails in development', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500, { error: 'Server error' });

      const result = await getTimezoneByIP('127.0.0.1');

      expect(result).toHaveProperty('ip', '127.0.0.1');
      expect(result).toHaveProperty('city', 'San Francisco');
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
      expect(result).toHaveProperty('fallback', true);
      expect(result.cached).toBe(false);
    });

    test('should use fallback data for private IP when API fails in development', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500, { error: 'Server error' });

      const result = await getTimezoneByIP('192.168.1.1');

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
    });

    test('should use fallback for any IP in development when API fails', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError('8.8.8.8', 500);

      const result = await getTimezoneByIP('8.8.8.8');

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
    });

    test('should NOT use fallback in production mode', async () => {
      process.env.NODE_ENV = 'production';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should NOT use fallback in QA/test environment', async () => {
      process.env.NODE_ENV = 'qa';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should NOT use fallback in staging environment', async () => {
      process.env.NODE_ENV = 'staging';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should cache fallback data like normal responses', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500);

      // First call uses fallback
      const result1 = await getTimezoneByIP('127.0.0.1');
      expect(result1.fallback).toBe(true);
      expect(result1.cached).toBe(false);

      // Second call should be cached (no new nock needed)
      const result2 = await getTimezoneByIP('127.0.0.1');
      expect(result2.cached).toBe(true);
      expect(result2.city).toBe('San Francisco');
    });

    test('should include all required fields in fallback response', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      mockGeolocationError(null, 500);

      const result = await getTimezoneByIP('127.0.0.1');

      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('region');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('countryCode');
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('utcOffset');
      expect(result).toHaveProperty('currentTime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('cached');
      expect(result).toHaveProperty('fallback');
    });
  });

  describe('API key support', () => {
    test('should call unauthenticated URL when no API key is set', async () => {
      jest.resetModules();
      const {
        getTimezoneByIP: freshGet,
        clearCache: freshClear,
      } = require('../../../src/services/geolocation');
      freshClear();
      // config.geolocationApiKey is null by default
      const scope = mockGeolocationSuccess('8.8.8.8');
      await freshGet('8.8.8.8');
      expect(scope.isDone()).toBe(true);
    });

    test('should use free tier first when API key is set in test/dev environment', async () => {
      jest.resetModules();
      const freshConfig = require('../../../src/config');
      const {
        getTimezoneByIP: freshGet,
        clearCache: freshClear,
      } = require('../../../src/services/geolocation');
      freshClear();
      freshConfig.geolocationApiKey = 'test-key-abc';
      try {
        const freeScope = mockGeolocationSuccess('8.8.8.8');
        const keyScope = mockGeolocationSuccess('8.8.8.8', MOCK_RESPONSES.SUCCESS, {
          key: 'test-key-abc',
        });
        await freshGet('8.8.8.8');
        expect(freeScope.isDone()).toBe(true);
        expect(keyScope.isDone()).toBe(false); // key not used when free tier succeeds
      } finally {
        freshConfig.geolocationApiKey = null;
        nock.cleanAll();
      }
    });

    test('should fall back to API key when free tier returns 429', async () => {
      jest.resetModules();
      const freshConfig = require('../../../src/config');
      const {
        getTimezoneByIP: freshGet,
        clearCache: freshClear,
      } = require('../../../src/services/geolocation');
      freshClear();
      freshConfig.geolocationApiKey = 'test-key-abc';
      try {
        mockGeolocationRateLimit('8.8.8.8');
        const keyScope = mockGeolocationSuccess('8.8.8.8', MOCK_RESPONSES.SUCCESS, {
          key: 'test-key-abc',
        });
        const result = await freshGet('8.8.8.8');
        expect(keyScope.isDone()).toBe(true);
        expect(result.city).toBe('Mountain View');
      } finally {
        freshConfig.geolocationApiKey = null;
      }
    });

    test('should propagate 429 to retry logic when both free tier and API key are rate limited', async () => {
      jest.resetModules();
      const freshConfig = require('../../../src/config');
      const {
        getTimezoneByIP: freshGet,
        clearCache: freshClear,
      } = require('../../../src/services/geolocation');
      freshClear();
      freshConfig.geolocationApiKey = 'test-key-abc';
      try {
        // fetchWithRetry retries fetchFromAPI up to UPSTREAM_MAX_RETRIES (3) times = 4 total attempts
        mockGeolocationRateLimit('8.8.8.8', { times: 4, retryAfter: 0 });
        mockGeolocationRateLimit('8.8.8.8', { times: 4, retryAfter: 0, key: 'test-key-abc' });
        await expect(freshGet('8.8.8.8')).rejects.toMatchObject({ rateLimited: true });
      } finally {
        freshConfig.geolocationApiKey = null;
      }
    });

    test('should use API key on first request in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const freshConfig = require('../../../src/config');
      const {
        getTimezoneByIP: freshGet,
        clearCache: freshClear,
      } = require('../../../src/services/geolocation');
      freshClear();
      freshConfig.geolocationApiKey = 'test-key-abc';
      try {
        const keyScope = mockGeolocationSuccess('8.8.8.8', MOCK_RESPONSES.SUCCESS, {
          key: 'test-key-abc',
        });
        await freshGet('8.8.8.8');
        expect(keyScope.isDone()).toBe(true); // key used on first request in production
      } finally {
        freshConfig.geolocationApiKey = null;
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
