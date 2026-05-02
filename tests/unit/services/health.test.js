const {
  checkGeolocationAPI,
  checkCache,
  performHealthCheck,
} = require('../../../src/services/health');
const cache = require('../../../src/services/cache');
const {
  MOCK_RESPONSES,
  mockGeolocationSuccess,
  mockGeolocationError,
  mockGeolocationNetworkError,
} = require('../../helpers/nock-mocks');
const { setupGeolocationTests } = require('../../helpers/test-setup');

describe('Health Service', () => {
  setupGeolocationTests(() => cache.flush());

  describe('checkGeolocationAPI', () => {
    test('should return healthy when API is accessible', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.MINIMAL);

      const result = await checkGeolocationAPI();

      expect(result.status).toBe('healthy');
      expect(result.message).toContain('accessible');
      expect(result.responseTime).toMatch(/\d+ms/);
    });

    test('should return unhealthy when API times out', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY, { delayConnection: 3000 });

      const result = await checkGeolocationAPI();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('error');
      expect(result.error).toBeDefined();
    });

    test('should return unhealthy when API returns 500', async () => {
      mockGeolocationError(null, 500, { error: 'Server Error' });

      const result = await checkGeolocationAPI();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('error');
    });

    test('should return unhealthy on network error', async () => {
      mockGeolocationNetworkError(null, 'ECONNREFUSED');

      const result = await checkGeolocationAPI();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('ECONNREFUSED');
    });

    test('should complete check within timeout period', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY);

      const startTime = Date.now();
      await checkGeolocationAPI();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2500); // Should timeout at 2000ms
    });
  });

  describe('checkCache', () => {
    test('should return healthy when cache is operational', () => {
      // Add some data to cache
      cache.set('test-key', 'test-value');

      const result = checkCache();

      expect(result.status).toBe('healthy');
      expect(result.message).toContain('operational');
      expect(result.keys).toBeGreaterThan(0);
      expect(result.hitRate).toBeDefined();
    });

    test('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1'); // Generate a hit

      const result = checkCache();

      expect(result.status).toBe('healthy');
      expect(result.keys).toBe(2);
      expect(parseFloat(result.hitRate)).toBeGreaterThan(0);
    });

    test('should handle cache errors gracefully', () => {
      // Mock getStats to throw error
      jest.spyOn(cache, 'getStats').mockImplementation(() => {
        throw new Error('Cache connection lost');
      });

      const result = checkCache();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Cache error');

      cache.getStats.mockRestore();
    });
  });

  describe('performHealthCheck', () => {
    test('should return healthy when all checks pass', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY);

      const result = await performHealthCheck();

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.checks.geolocationAPI.status).toBe('healthy');
      expect(result.checks.cache.status).toBe('healthy');
      expect(result.responseTime).toMatch(/\d+ms/);
    });

    test('should return degraded when API check fails', async () => {
      mockGeolocationError(null, 500);

      const result = await performHealthCheck();

      expect(result.status).toBe('degraded');
      expect(result.checks.geolocationAPI.status).toBe('unhealthy');
      expect(result.checks.cache.status).toBe('healthy');
    });

    test('should return degraded when cache check fails', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY);

      jest.spyOn(cache, 'getStats').mockImplementation(() => {
        throw new Error('Cache error');
      });

      const result = await performHealthCheck();

      expect(result.status).toBe('degraded');
      expect(result.checks.geolocationAPI.status).toBe('healthy');
      expect(result.checks.cache.status).toBe('unhealthy');

      cache.getStats.mockRestore();
    });

    test('should run checks in parallel', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY, { delay: 500 });

      const startTime = Date.now();
      await performHealthCheck();
      const duration = Date.now() - startTime;

      // Should complete in ~500ms, not 1000ms (if sequential)
      expect(duration).toBeLessThan(700);
    });

    test('should include all required fields', async () => {
      mockGeolocationSuccess(null, MOCK_RESPONSES.EMPTY);

      const result = await performHealthCheck();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('responseTime');
      expect(result.checks).toHaveProperty('geolocationAPI');
      expect(result.checks).toHaveProperty('cache');
    });
  });
});
