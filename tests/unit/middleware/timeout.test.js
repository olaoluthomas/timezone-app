const timeoutMiddleware = require('../../../src/middleware/timeout');

describe('Timeout Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      setTimeout: jest.fn(),
    };
    res = {
      setTimeout: jest.fn(),
    };
    next = jest.fn();
  });

  describe('basic functionality', () => {
    it('should be a function', () => {
      expect(typeof timeoutMiddleware).toBe('function');
    });

    it('should return a middleware function', () => {
      const middleware = timeoutMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should call next()', () => {
      const middleware = timeoutMiddleware();
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('default timeout', () => {
    it('should set request timeout to 30000ms by default', () => {
      const middleware = timeoutMiddleware();
      middleware(req, res, next);

      expect(req.setTimeout).toHaveBeenCalledWith(30000);
    });

    it('should set response timeout to 30000ms by default', () => {
      const middleware = timeoutMiddleware();
      middleware(req, res, next);

      expect(res.setTimeout).toHaveBeenCalledWith(30000);
    });
  });

  describe('custom timeout', () => {
    it('should accept custom timeout value', () => {
      const middleware = timeoutMiddleware(5000);
      middleware(req, res, next);

      expect(req.setTimeout).toHaveBeenCalledWith(5000);
      expect(res.setTimeout).toHaveBeenCalledWith(5000);
    });

    it('should handle different timeout values', () => {
      const testCases = [1000, 10000, 60000, 120000];

      testCases.forEach((timeout) => {
        const middleware = timeoutMiddleware(timeout);
        const mockReq = { setTimeout: jest.fn() };
        const mockRes = { setTimeout: jest.fn() };
        const mockNext = jest.fn();

        middleware(mockReq, mockRes, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(timeout);
        expect(mockRes.setTimeout).toHaveBeenCalledWith(timeout);
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('execution order', () => {
    it('should set timeouts before calling next', () => {
      const callOrder = [];

      req.setTimeout = jest.fn(() => callOrder.push('req'));
      res.setTimeout = jest.fn(() => callOrder.push('res'));
      next = jest.fn(() => callOrder.push('next'));

      const middleware = timeoutMiddleware();
      middleware(req, res, next);

      expect(callOrder).toEqual(['req', 'res', 'next']);
    });
  });
});
