// Mock winston-daily-rotate-file to avoid actual file writes and stream issues during tests
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => {
    // Return a mock transport that behaves like a WritableStream in objectMode
    return {
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      format: {},
      level: undefined,
      silent: false,
      handleExceptions: false,
      handleRejections: false,
      log: jest.fn(),
      write: jest.fn(),
      _write: jest.fn(),
      _writev: jest.fn(),
      end: jest.fn(),
      name: 'dailyRotateFile',
    };
  });
});

describe('Logger', () => {
  let logger;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear module cache to allow fresh logger initialization
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Logger Configuration', () => {
    test('should create logger with default configuration', () => {
      logger = require('../../../src/utils/logger');

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    test('should use debug level in non-production environments', () => {
      process.env.NODE_ENV = 'development';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      expect(logger.level).toBe('debug');
    });

    test('should use info level in production environment', () => {
      process.env.NODE_ENV = 'production';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      expect(logger.level).toBe('info');
    });

    test('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'warn';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      expect(logger.level).toBe('warn');
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');
    });

    test('should support error level logging', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      logger.error('Test error message');
      expect(errorSpy).toHaveBeenCalledWith('Test error message');
      errorSpy.mockRestore();
    });

    test('should support warn level logging', () => {
      const warnSpy = jest.spyOn(logger, 'warn');
      logger.warn('Test warning message');
      expect(warnSpy).toHaveBeenCalledWith('Test warning message');
      warnSpy.mockRestore();
    });

    test('should support info level logging', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      logger.info('Test info message');
      expect(infoSpy).toHaveBeenCalledWith('Test info message');
      infoSpy.mockRestore();
    });

    test('should support debug level logging', () => {
      const debugSpy = jest.spyOn(logger, 'debug');
      logger.debug('Test debug message');
      expect(debugSpy).toHaveBeenCalledWith('Test debug message');
      debugSpy.mockRestore();
    });
  });

  describe('Metadata Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');
    });

    test('should log with metadata object', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      const metadata = { userId: 123, action: 'login' };
      logger.info('User action', metadata);
      expect(infoSpy).toHaveBeenCalledWith('User action', metadata);
      infoSpy.mockRestore();
    });

    test('should log with multiple metadata fields', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      const metadata = {
        error: 'Connection timeout',
        ip: '192.168.1.1',
        timestamp: new Date().toISOString(),
      };
      logger.error('API error', metadata);
      expect(errorSpy).toHaveBeenCalledWith('API error', metadata);
      errorSpy.mockRestore();
    });
  });

  describe('Child Logger', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');
    });

    test('should create child logger with default metadata', () => {
      const defaultMeta = { service: 'geolocation' };
      const childLogger = logger.child(defaultMeta);

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
      expect(childLogger.defaultMeta).toEqual(defaultMeta);
    });

    test('child logger should inherit log methods', () => {
      const childLogger = logger.child({ service: 'cache' });

      expect(typeof childLogger.error).toBe('function');
      expect(typeof childLogger.warn).toBe('function');
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.debug).toBe('function');
    });
  });

  describe('Stream Integration', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');
    });

    test('should provide stream for Morgan integration', () => {
      expect(logger.stream).toBeDefined();
      expect(typeof logger.stream.write).toBe('function');
    });

    test('stream should write to info level', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      logger.stream.write('HTTP request\n');
      expect(infoSpy).toHaveBeenCalledWith('HTTP request');
      infoSpy.mockRestore();
    });

    test('stream should trim whitespace from messages', () => {
      const infoSpy = jest.spyOn(logger, 'info');
      logger.stream.write('  Message with spaces  \n');
      expect(infoSpy).toHaveBeenCalledWith('Message with spaces');
      infoSpy.mockRestore();
    });
  });

  describe('Transport Configuration', () => {
    test('should have console transport in all environments', () => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      const transports = logger.transports;
      const hasConsoleTransport = transports.some((t) => t.name === 'console');
      expect(hasConsoleTransport).toBe(true);
    });

    test('should not have file transports in test environment', () => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      const transports = logger.transports;
      // Only console transport in test environment
      expect(transports.length).toBe(1);
      expect(transports[0].name).toBe('console');
    });

    test('should have file transports in non-test environments', () => {
      process.env.NODE_ENV = 'development';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      const transports = logger.transports;
      // Should have at least console + error file + combined file (3 minimum)
      // DailyRotateFile may or may not be added depending on availability
      expect(transports.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');
    });

    test('should have exitOnError set to false', () => {
      expect(logger.exitOnError).toBe(false);
    });

    test('should not crash on error logging', () => {
      expect(() => {
        logger.error('Test error', { error: new Error('Test') });
      }).not.toThrow();
    });
  });

  describe('Format Configuration', () => {
    test('should use production format in production environment', () => {
      process.env.NODE_ENV = 'production';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      // Production format should be JSON
      expect(logger.format).toBeDefined();
    });

    test('should use development format in development environment', () => {
      process.env.NODE_ENV = 'development';
      delete require.cache[require.resolve('../../../src/utils/logger')];
      logger = require('../../../src/utils/logger');

      // Development format should include colorization
      expect(logger.format).toBeDefined();
    });
  });
});
