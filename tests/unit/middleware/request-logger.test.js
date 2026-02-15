/**
 * Tests for Request/Response Logging Middleware
 *
 * @module tests/unit/middleware/request-logger
 */

const requestLogger = require('../../../src/middleware/request-logger');
const logger = require('../../../src/utils/logger');

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Request Logger Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    req = {
      method: 'GET',
      url: '/api/timezone',
      ip: '192.168.1.1',
      get: jest.fn((header) => {
        if (header === 'user-agent') return 'Mozilla/5.0';
        return null;
      }),
    };

    // Mock response object with event emitter
    res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        // Store callback to call it later
        res._finishCallback = callback;
      }),
    };

    // Mock next function
    next = jest.fn();
  });

  describe('basic functionality', () => {
    test('should be a function', () => {
      expect(typeof requestLogger).toBe('function');
    });

    test('should call next()', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('should call next() immediately without waiting', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('incoming request logging', () => {
    test('should log incoming request', () => {
      requestLogger(req, res, next);

      expect(logger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/api/timezone',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
    });

    test('should log POST requests', () => {
      req.method = 'POST';
      req.url = '/api/data';

      requestLogger(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'POST',
          url: '/api/data',
        })
      );
    });

    test('should handle missing user-agent', () => {
      req.get = jest.fn(() => null);

      requestLogger(req, res, next);

      expect(logger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userAgent: null,
        })
      );
    });
  });

  describe('response completion logging', () => {
    test('should register finish event listener', () => {
      requestLogger(req, res, next);

      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    test('should log completed request on finish', () => {
      requestLogger(req, res, next);

      // Trigger finish event
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          method: 'GET',
          url: '/api/timezone',
          status: 200,
          ip: '192.168.1.1',
        })
      );
    });

    test('should include request duration', () => {
      requestLogger(req, res, next);

      // Simulate 100ms delay
      jest.advanceTimersByTime(100);

      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          duration: expect.stringMatching(/\d+ms/),
        })
      );
    });
  });

  describe('log levels based on status code', () => {
    test('should use info level for 2xx status codes', () => {
      res.statusCode = 200;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith('Request completed', expect.any(Object));
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('should use info level for 3xx status codes', () => {
      res.statusCode = 301;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith('Request completed', expect.any(Object));
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('should use warn level for 4xx status codes', () => {
      res.statusCode = 404;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.warn).toHaveBeenCalledWith('Request completed', expect.any(Object));
      expect(logger.info).toHaveBeenCalledTimes(1); // Only for incoming request
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('should use warn level for 400 status code', () => {
      res.statusCode = 400;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.warn).toHaveBeenCalledWith('Request completed', expect.any(Object));
    });

    test('should use error level for 5xx status codes', () => {
      res.statusCode = 500;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.error).toHaveBeenCalledWith('Request completed', expect.any(Object));
      expect(logger.info).toHaveBeenCalledTimes(1); // Only for incoming request
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('should use error level for 503 status code', () => {
      res.statusCode = 503;
      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.error).toHaveBeenCalledWith('Request completed', expect.any(Object));
    });
  });

  describe('different request types', () => {
    test('should handle health check requests', () => {
      req.url = '/health';
      req.method = 'GET';

      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          url: '/health',
          method: 'GET',
        })
      );
    });

    test('should handle API requests with query parameters', () => {
      req.url = '/api/timezone?format=json';

      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          url: '/api/timezone?format=json',
        })
      );
    });

    test('should handle requests with different IPs', () => {
      req.ip = '10.0.0.1';

      requestLogger(req, res, next);
      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          ip: '10.0.0.1',
        })
      );
    });
  });

  describe('performance', () => {
    test('should not block request processing', () => {
      const startTime = Date.now();
      requestLogger(req, res, next);
      const endTime = Date.now();

      // Middleware should complete in less than 10ms
      expect(endTime - startTime).toBeLessThan(10);
      expect(next).toHaveBeenCalled();
    });

    test('should calculate duration accurately', () => {
      jest.useFakeTimers();

      requestLogger(req, res, next);

      // Simulate 250ms request duration
      jest.advanceTimersByTime(250);

      res._finishCallback();

      expect(logger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          duration: '250ms',
        })
      );

      jest.useRealTimers();
    });
  });
});
