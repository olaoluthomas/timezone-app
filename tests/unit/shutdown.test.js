/**
 * Graceful Shutdown Tests
 *
 * Comprehensive tests for graceful shutdown functionality including:
 * - Signal handling (SIGTERM, SIGINT)
 * - Timeout behavior
 * - Error handling
 * - Cache cleanup
 * - Logging verification
 * - Exit code validation
 *
 * @jest-environment node
 */

const { gracefulShutdown } = require('../../src/index');
const cache = require('../../src/services/cache');
const logger = require('../../src/utils/logger');
const CONSTANTS = require('../../src/config/constants');

describe('Graceful Shutdown', () => {
  let mockServer;
  let mockExit;

  beforeEach(() => {
    // Use real timers by default
    jest.useRealTimers();

    // Mock process.exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock logger to prevent console output during tests
    jest.spyOn(logger, 'info').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});

    // Create mock server
    mockServer = {
      close: jest.fn((callback) => {
        // Default: successful close
        setImmediate(() => callback());
      }),
      listening: true,
    };
  });

  afterEach(() => {
    // Cleanup
    mockExit.mockRestore();
    logger.info.mockRestore();
    logger.error.mockRestore();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Successful shutdown', () => {
    test('should log shutdown signal received', () => {
      gracefulShutdown(mockServer, 'SIGTERM');

      expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
        signal: 'SIGTERM',
      });
    });

    test('should close server', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(mockServer.close).toHaveBeenCalled();
        done();
      });
    });

    test('should flush cache during shutdown', (done) => {
      const flushSpy = jest.spyOn(cache, 'flush');

      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(flushSpy).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith('Cache flushed successfully');
        flushSpy.mockRestore();
        done();
      });
    });

    test('should log successful server closure', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('HTTP server closed successfully', {
          signal: 'SIGTERM',
        });
        done();
      });
    });

    test('should log graceful shutdown completed', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Graceful shutdown completed', {
          signal: 'SIGTERM',
        });
        done();
      });
    });

    test('should exit with code 0 on success', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(mockExit).toHaveBeenCalledWith(0);
        done();
      });
    });
  });

  describe('SIGTERM handling', () => {
    test('should handle SIGTERM signal', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'SIGTERM',
        });
        expect(mockExit).toHaveBeenCalledWith(0);
        done();
      });
    });
  });

  describe('SIGINT handling', () => {
    test('should handle SIGINT signal', (done) => {
      gracefulShutdown(mockServer, 'SIGINT');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'SIGINT',
        });
        expect(mockExit).toHaveBeenCalledWith(0);
        done();
      });
    });
  });

  describe('Timeout behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should set timeout for forced shutdown', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      gracefulShutdown(mockServer, 'SIGTERM');

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT
      );

      setTimeoutSpy.mockRestore();
    });

    test('should force shutdown after timeout if server does not close', () => {
      // Mock server.close to never call callback
      mockServer.close = jest.fn();

      gracefulShutdown(mockServer, 'SIGTERM');

      // Fast-forward time
      jest.advanceTimersByTime(CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT);

      expect(logger.error).toHaveBeenCalledWith(
        'Graceful shutdown timeout exceeded, forcing shutdown',
        {
          timeout: CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT,
          signal: 'SIGTERM',
        }
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test('should exit with code 1 on timeout', () => {
      // Mock server.close to hang
      mockServer.close = jest.fn();

      gracefulShutdown(mockServer, 'SIGTERM');

      jest.advanceTimersByTime(CONSTANTS.GRACEFUL_SHUTDOWN_TIMEOUT);

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Error handling', () => {
    test('should handle server.close error', (done) => {
      const testError = new Error('Server close error');

      mockServer.close = jest.fn((callback) => {
        setImmediate(() => callback(testError));
      });

      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.error).toHaveBeenCalledWith('Error during server shutdown', {
          error: testError.message,
          stack: testError.stack,
          signal: 'SIGTERM',
        });
        expect(mockExit).toHaveBeenCalledWith(1);
        done();
      });
    });

    test('should exit with code 1 on server error', (done) => {
      const testError = new Error('Shutdown error');

      mockServer.close = jest.fn((callback) => {
        setImmediate(() => callback(testError));
      });

      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(mockExit).toHaveBeenCalledWith(1);
        done();
      });
    });

    test('should handle cache flush error gracefully', (done) => {
      const cacheError = new Error('Cache flush error');

      jest.spyOn(cache, 'flush').mockImplementation(() => {
        throw cacheError;
      });

      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.error).toHaveBeenCalledWith('Error flushing cache', {
          error: cacheError.message,
          signal: 'SIGTERM',
        });
        // Should still exit successfully even if cache flush fails
        expect(mockExit).toHaveBeenCalledWith(0);
        cache.flush.mockRestore();
        done();
      });
    });

    test('should log cache flush error but continue shutdown', (done) => {
      const cacheError = new Error('Cache error');

      jest.spyOn(cache, 'flush').mockImplementation(() => {
        throw cacheError;
      });

      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.error).toHaveBeenCalledWith('Error flushing cache', {
          error: cacheError.message,
          signal: 'SIGTERM',
        });
        expect(logger.info).toHaveBeenCalledWith('Graceful shutdown completed', {
          signal: 'SIGTERM',
        });
        cache.flush.mockRestore();
        done();
      });
    });
  });

  describe('Different signals', () => {
    test('should handle SIGTERM signal', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'SIGTERM',
        });
        done();
      });
    });

    test('should handle SIGINT signal', (done) => {
      gracefulShutdown(mockServer, 'SIGINT');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'SIGINT',
        });
        done();
      });
    });

    test('should handle UNCAUGHT_EXCEPTION signal', (done) => {
      gracefulShutdown(mockServer, 'UNCAUGHT_EXCEPTION');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'UNCAUGHT_EXCEPTION',
        });
        done();
      });
    });

    test('should handle UNHANDLED_REJECTION signal', (done) => {
      gracefulShutdown(mockServer, 'UNHANDLED_REJECTION');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'UNHANDLED_REJECTION',
        });
        done();
      });
    });
  });

  describe('Logging verification', () => {
    test('should log all shutdown stages', (done) => {
      gracefulShutdown(mockServer, 'SIGTERM');

      setImmediate(() => {
        // Verify all log calls
        expect(logger.info).toHaveBeenCalledWith('Shutdown signal received', {
          signal: 'SIGTERM',
        });
        expect(logger.info).toHaveBeenCalledWith('HTTP server closed successfully', {
          signal: 'SIGTERM',
        });
        expect(logger.info).toHaveBeenCalledWith('Cache flushed successfully');
        expect(logger.info).toHaveBeenCalledWith('Graceful shutdown completed', {
          signal: 'SIGTERM',
        });
        done();
      });
    });

    test('should include signal in all relevant logs', (done) => {
      gracefulShutdown(mockServer, 'TEST_SIGNAL');

      setImmediate(() => {
        expect(logger.info).toHaveBeenCalledWith(
          'Shutdown signal received',
          expect.objectContaining({ signal: 'TEST_SIGNAL' })
        );
        expect(logger.info).toHaveBeenCalledWith(
          'HTTP server closed successfully',
          expect.objectContaining({ signal: 'TEST_SIGNAL' })
        );
        expect(logger.info).toHaveBeenCalledWith(
          'Graceful shutdown completed',
          expect.objectContaining({ signal: 'TEST_SIGNAL' })
        );
        done();
      });
    });
  });
});
