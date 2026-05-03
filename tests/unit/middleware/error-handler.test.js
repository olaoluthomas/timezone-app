const { APIError, errorHandler } = require('../../../src/middleware/error-handler');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
}));

// Default to production mode; individual tests override when testing dev behavior
jest.mock('../../../src/config', () => ({ isDevelopment: false }));

describe('Error Handler Middleware', () => {
  let err, req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    err = new Error('something went wrong');
    req = { method: 'GET', url: '/api/timezone', ip: '1.2.3.4' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  describe('APIError class', () => {
    test('sets statusCode', () => {
      const e = new APIError('bad request', 400);
      expect(e.statusCode).toBe(400);
    });

    test('defaults statusCode to 500', () => {
      const e = new APIError('error');
      expect(e.statusCode).toBe(500);
    });

    test('sets details', () => {
      const e = new APIError('rate limited', 503, { retryAfter: 60 });
      expect(e.details).toEqual({ retryAfter: 60 });
    });

    test('sets name to APIError', () => {
      const e = new APIError('error');
      expect(e.name).toBe('APIError');
    });

    test('is an instance of Error', () => {
      const e = new APIError('error');
      expect(e).toBeInstanceOf(Error);
    });
  });

  describe('errorHandler', () => {
    test('responds with err.statusCode when present', () => {
      err = new APIError('not found', 404);
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('defaults to 500 for generic errors', () => {
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('includes error message in response body', () => {
      errorHandler(err, req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'something went wrong' })
      );
    });

    test('falls back to Internal server error when message is empty', () => {
      err.message = '';
      errorHandler(err, req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Internal server error' })
      );
    });

    test('logs error with request context', () => {
      errorHandler(err, req, res, next);
      expect(logger.error).toHaveBeenCalledWith(
        'Request error',
        expect.objectContaining({
          method: 'GET',
          url: '/api/timezone',
          ip: '1.2.3.4',
          statusCode: 500,
        })
      );
    });

    test('sets Retry-After header when details.retryAfter is present', () => {
      err = new APIError('unavailable', 503, { retryAfter: 60 });
      errorHandler(err, req, res, next);
      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    });

    test('does not set Retry-After header when details has no retryAfter', () => {
      errorHandler(err, req, res, next);
      expect(res.setHeader).not.toHaveBeenCalledWith('Retry-After', expect.anything());
    });

    test('hides stack and details in production (isDevelopment: false)', () => {
      err.stack = 'Error: ...\n  at handler (app.js:1)';
      errorHandler(err, req, res, next);
      const body = res.json.mock.calls[0][0];
      expect(body.stack).toBeUndefined();
      expect(body.details).toBeUndefined();
    });

    test('includes stack and details in development (isDevelopment: true)', () => {
      // Re-require with isDevelopment: true override
      jest.resetModules();
      jest.mock('../../../src/config', () => ({ isDevelopment: true }));
      jest.mock('../../../src/utils/logger', () => ({ error: jest.fn() }));
      const { errorHandler: devErrorHandler } = require('../../../src/middleware/error-handler');

      err = new APIError('fail', 500, { info: 'extra' });
      err.stack = 'Error: fail\n  at handler (app.js:1)';
      devErrorHandler(err, req, res, next);

      const body = res.json.mock.calls[0][0];
      expect(body.stack).toBeDefined();
      expect(body.details).toEqual({ info: 'extra' });
    });

    test('handles 4xx APIError (e.g. 400 Bad Request)', () => {
      err = new APIError('invalid input', 400);
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'invalid input' }));
    });
  });
});
