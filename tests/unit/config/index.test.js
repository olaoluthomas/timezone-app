/**
 * Tests for Centralized Configuration Management
 *
 * @module tests/unit/config/index
 */

describe('Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear config cache
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('default values', () => {
    test('should use default PORT when not set', () => {
      delete process.env.PORT;
      const config = require('../../../src/config');
      expect(config.port).toBe(3000);
    });

    test('should use default NODE_ENV when not set', () => {
      delete process.env.NODE_ENV;
      const config = require('../../../src/config');
      expect(config.nodeEnv).toBe('development');
    });

    test('should use default CORS_ORIGIN when not set', () => {
      delete process.env.CORS_ORIGIN;
      const config = require('../../../src/config');
      expect(config.corsOrigin).toBe('*');
    });

    test('should use environment-specific log level', () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'production';
      const config = require('../../../src/config');
      expect(config.logLevel).toBe('info');
    });

    test('should use debug log level in development', () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'development';
      const config = require('../../../src/config');
      expect(config.logLevel).toBe('debug');
    });
  });

  describe('environment variable parsing', () => {
    test('should parse PORT as number', () => {
      process.env.PORT = '4000';
      const config = require('../../../src/config');
      expect(config.port).toBe(4000);
      expect(typeof config.port).toBe('number');
    });

    test('should parse NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      const config = require('../../../src/config');
      expect(config.nodeEnv).toBe('production');
    });

    test('should parse LOG_LEVEL', () => {
      process.env.LOG_LEVEL = 'warn';
      const config = require('../../../src/config');
      expect(config.logLevel).toBe('warn');
    });

    test('should parse CORS_ORIGIN', () => {
      process.env.CORS_ORIGIN = 'https://example.com';
      const config = require('../../../src/config');
      expect(config.corsOrigin).toBe('https://example.com');
    });

    test('should parse ALLOWED_ORIGINS as array', () => {
      process.env.ALLOWED_ORIGINS = 'https://app1.com,https://app2.com';
      const config = require('../../../src/config');
      expect(config.allowedOrigins).toEqual(['https://app1.com', 'https://app2.com']);
    });

    test('should handle ALLOWED_ORIGINS with spaces', () => {
      process.env.ALLOWED_ORIGINS = 'https://app1.com, https://app2.com , https://app3.com';
      const config = require('../../../src/config');
      expect(config.allowedOrigins).toEqual([
        'https://app1.com',
        'https://app2.com',
        'https://app3.com',
      ]);
    });

    test('should filter empty ALLOWED_ORIGINS entries', () => {
      process.env.ALLOWED_ORIGINS = 'https://app1.com,,https://app2.com';
      const config = require('../../../src/config');
      expect(config.allowedOrigins).toEqual(['https://app1.com', 'https://app2.com']);
    });

    test('should return empty array when ALLOWED_ORIGINS is empty string', () => {
      process.env.ALLOWED_ORIGINS = '';
      const config = require('../../../src/config');
      expect(config.allowedOrigins).toEqual([]);
    });

    test('should return empty array when ALLOWED_ORIGINS is not set', () => {
      delete process.env.ALLOWED_ORIGINS;
      const config = require('../../../src/config');
      expect(config.allowedOrigins).toEqual([]);
    });
  });

  describe('PORT validation and parsing', () => {
    test('should handle invalid PORT (non-numeric)', () => {
      process.env.PORT = 'invalid';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const config = require('../../../src/config');

      expect(config.port).toBe(3000);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid PORT "invalid"'));

      consoleSpy.mockRestore();
    });

    test('should reject PORT below valid range', () => {
      process.env.PORT = '0';
      expect(() => require('../../../src/config')).toThrow(
        'Invalid PORT configuration: 0. Must be between 1 and 65535.'
      );
    });

    test('should reject PORT above valid range', () => {
      process.env.PORT = '65536';
      expect(() => require('../../../src/config')).toThrow(
        'Invalid PORT configuration: 65536. Must be between 1 and 65535.'
      );
    });

    test('should accept PORT at lower boundary', () => {
      process.env.PORT = '1';
      const config = require('../../../src/config');
      expect(config.port).toBe(1);
    });

    test('should accept PORT at upper boundary', () => {
      process.env.PORT = '65535';
      const config = require('../../../src/config');
      expect(config.port).toBe(65535);
    });
  });

  describe('production warnings', () => {
    test('should warn about wildcard CORS in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = '*';
      delete process.env.ALLOWED_ORIGINS;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      require('../../../src/config');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CORS origin set to wildcard (*) in production')
      );

      consoleSpy.mockRestore();
    });

    test('should not warn about wildcard CORS in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.CORS_ORIGIN = '*';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      require('../../../src/config');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not warn when ALLOWED_ORIGINS is set in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = '*';
      process.env.ALLOWED_ORIGINS = 'https://example.com';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      require('../../../src/config');

      // Should only warn about non-standard NODE_ENV values, not CORS
      const corsWarnings = consoleSpy.mock.calls.filter((call) => call[0].includes('CORS'));
      expect(corsWarnings.length).toBe(0);

      consoleSpy.mockRestore();
    });

    test('should warn about non-standard NODE_ENV', () => {
      process.env.NODE_ENV = 'staging';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      require('../../../src/config');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('NODE_ENV "staging" is not standard')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('environment helper methods', () => {
    test('isProduction should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const config = require('../../../src/config');
      expect(config.isProduction).toBe(true);
      expect(config.isDevelopment).toBe(false);
      expect(config.isTest).toBe(false);
    });

    test('isDevelopment should return true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      const config = require('../../../src/config');
      expect(config.isProduction).toBe(false);
      expect(config.isDevelopment).toBe(true);
      expect(config.isTest).toBe(false);
    });

    test('isTest should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const config = require('../../../src/config');
      expect(config.isProduction).toBe(false);
      expect(config.isDevelopment).toBe(false);
      expect(config.isTest).toBe(true);
    });

    test('isDevelopment should be default when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const config = require('../../../src/config');
      expect(config.isDevelopment).toBe(true);
    });
  });

  describe('configuration structure', () => {
    test('should export singleton instance', () => {
      const config1 = require('../../../src/config');
      const config2 = require('../../../src/config');
      expect(config1).toBe(config2);
    });

    test('should have all required properties', () => {
      const config = require('../../../src/config');

      expect(config).toHaveProperty('nodeEnv');
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('logLevel');
      expect(config).toHaveProperty('corsOrigin');
      expect(config).toHaveProperty('allowedOrigins');
      expect(config).toHaveProperty('isProduction');
      expect(config).toHaveProperty('isDevelopment');
      expect(config).toHaveProperty('isTest');
    });

    test('should have correct property types', () => {
      const config = require('../../../src/config');

      expect(typeof config.nodeEnv).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.logLevel).toBe('string');
      expect(typeof config.corsOrigin).toBe('string');
      expect(Array.isArray(config.allowedOrigins)).toBe(true);
      expect(typeof config.isProduction).toBe('boolean');
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.isTest).toBe('boolean');
    });
  });
});
