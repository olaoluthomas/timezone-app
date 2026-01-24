const cache = require('../../../src/services/cache');

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.flush();
  });

  afterAll(() => {
    // Clean up after all tests
    cache.flush();
  });

  describe('set and get', () => {
    test('should store and retrieve a value', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      cache.set(key, value);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    test('should return undefined for non-existent key', () => {
      const result = cache.get('non-existent-key');
      expect(result).toBeUndefined();
    });

    test('should overwrite existing key', () => {
      const key = 'test-key';
      cache.set(key, 'value1');
      cache.set(key, 'value2');

      const result = cache.get(key);
      expect(result).toBe('value2');
    });

    test('should handle multiple different keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('delete', () => {
    test('should delete a specific key', () => {
      const key = 'test-key';
      cache.set(key, 'value');

      const deleteCount = cache.delete(key);
      expect(deleteCount).toBe(1);
      expect(cache.get(key)).toBeUndefined();
    });

    test('should return 0 when deleting non-existent key', () => {
      const deleteCount = cache.delete('non-existent-key');
      expect(deleteCount).toBe(0);
    });
  });

  describe('flush', () => {
    test('should clear all cached entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.flush();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
      expect(cache.getKeyCount()).toBe(0);
    });
  });

  describe('getStats', () => {
    test('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();

      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
    });

    test('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();
      const expectedHitRate = ((2 / 3) * 100).toFixed(2);
      expect(stats.hitRate).toBe(expectedHitRate);
    });
  });

  describe('getKeyCount', () => {
    test('should return correct number of cached keys', () => {
      expect(cache.getKeyCount()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.getKeyCount()).toBe(1);

      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.getKeyCount()).toBe(3);

      cache.delete('key1');
      expect(cache.getKeyCount()).toBe(2);
    });
  });

  describe('TTL behavior', () => {
    test('should respect custom TTL', (done) => {
      const key = 'ttl-test-key';
      const value = 'ttl-test-value';
      const ttl = 1; // 1 second

      cache.set(key, value, ttl);
      expect(cache.get(key)).toBe(value);

      // Wait for TTL to expire
      setTimeout(() => {
        expect(cache.get(key)).toBeUndefined();
        done();
      }, 1500); // Wait 1.5 seconds
    }, 2000); // Increase test timeout
  });
});
