const nock = require('nock');
const { getTimezoneByIP, getCacheStats, clearCache } = require('../../../src/services/geolocation');

describe('GeolocationService', () => {
  const mockApiResponse = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country_name: 'United States',
    country_code: 'US',
    latitude: 37.4056,
    longitude: -122.0775,
    timezone: 'America/Los_Angeles',
    utc_offset: '-0800',
  };

  beforeEach(() => {
    // Clear cache before each test
    clearCache();
    // Clean all nock interceptors
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('getTimezoneByIP', () => {
    test('should fetch timezone data for valid IP', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('127.0.0.1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should handle IPv6 localhost (::1)', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should handle ::ffff:127.x.x.x format', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:127.0.0.1');

      expect(result).toHaveProperty('ip');
      expect(result.cached).toBe(false);
    });

    test('should throw error on API failure', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(500, { error: 'Internal Server Error' });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should throw error on network timeout', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').replyWithError({ code: 'ETIMEDOUT' });

      await expect(getTimezoneByIP('8.8.8.8')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should include all required fields in response', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

      const result1 = await getTimezoneByIP('8.8.8.8');

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = await getTimezoneByIP('8.8.8.8');

      expect(result2.cached).toBe(true);
      expect(result2.timestamp).not.toBe(result1.timestamp);
    });

    test('should include currentTime on cache hits', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

      nock('https://ipapi.co')
        .get('/1.1.1.1/json/')
        .reply(200, {
          ...mockApiResponse,
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
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/8.8.8.8/json/').twice().reply(200, mockApiResponse);

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
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:127.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (192.168.x.x)', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:192.168.1.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (10.x.x.x)', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:10.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped private IPs (172.16-31.x.x)', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:172.16.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle pure IPv6 localhost', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle pure IPv4 localhost', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('127.0.0.1');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should handle IPv6-mapped public IPs', async () => {
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:8.8.8.8');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('ip');
    });

    test('should normalize and use IPv4 for IPv6-mapped public IP', async () => {
      // When we pass ::ffff:8.8.8.8, it should normalize to 8.8.8.8
      // and make the API call with the pure IPv4 address
      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(200, mockApiResponse);

      const result = await getTimezoneByIP('::ffff:8.8.8.8');
      expect(result).toHaveProperty('ip', '8.8.8.8');
      expect(result.cached).toBe(false);
    });
  });

  describe('development fallback', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Clear cache using the original module
      clearCache();
      nock.cleanAll();
    });

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

      nock('https://ipapi.co').get('/json/').reply(429, { error: 'Rate limited' });

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

      nock('https://ipapi.co').get('/json/').reply(500, { error: 'Server error' });

      const result = await getTimezoneByIP('192.168.1.1');

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
    });

    test('should use fallback for any IP in development when API fails', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      nock('https://ipapi.co').get('/8.8.8.8/json/').reply(429);

      const result = await getTimezoneByIP('8.8.8.8');

      expect(result).toHaveProperty('fallback', true);
      expect(result).toHaveProperty('timezone', 'America/Los_Angeles');
    });

    test('should NOT use fallback in production mode', async () => {
      process.env.NODE_ENV = 'production';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      nock('https://ipapi.co').get('/json/').reply(429);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should NOT use fallback in QA/test environment', async () => {
      process.env.NODE_ENV = 'qa';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      nock('https://ipapi.co').get('/json/').reply(429);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should NOT use fallback in staging environment', async () => {
      process.env.NODE_ENV = 'staging';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      nock('https://ipapi.co').get('/json/').reply(429);

      await expect(getTimezoneByIP('127.0.0.1')).rejects.toThrow(
        'Unable to determine location from IP address'
      );
    });

    test('should cache fallback data like normal responses', async () => {
      process.env.NODE_ENV = 'development';
      // Clear module cache and re-require to pick up new NODE_ENV
      jest.resetModules();
      const { getTimezoneByIP } = require('../../../src/services/geolocation');

      nock('https://ipapi.co').get('/json/').reply(429);

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

      nock('https://ipapi.co').get('/json/').reply(429);

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
});
