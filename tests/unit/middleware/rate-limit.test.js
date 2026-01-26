/**
 * Rate Limit Middleware Unit Tests
 *
 * Note: express-rate-limit doesn't expose configuration options for unit testing.
 * The actual configuration values (windowMs, max, etc.) are tested in integration tests
 * by observing the middleware's behavior with real requests.
 *
 * These unit tests verify:
 * 1. The middleware module exports the correct functions
 * 2. The source code configuration matches expectations (via code review)
 */
describe('Rate Limit Middleware', () => {
  let apiLimiter, healthLimiter;

  beforeEach(() => {
    // Clear module cache and reload to get fresh instance
    jest.resetModules();
    const rateLimitModule = require('../../../src/middleware/rate-limit');
    apiLimiter = rateLimitModule.apiLimiter;
    healthLimiter = rateLimitModule.healthLimiter;
  });

  describe('module exports', () => {
    it('should export apiLimiter as a function', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should export healthLimiter as a function', () => {
      expect(healthLimiter).toBeDefined();
      expect(typeof healthLimiter).toBe('function');
    });

    it('should export both limiters', () => {
      const rateLimitModule = require('../../../src/middleware/rate-limit');
      expect(Object.keys(rateLimitModule)).toEqual(
        expect.arrayContaining(['apiLimiter', 'healthLimiter'])
      );
    });
  });

  describe('source code configuration validation', () => {
    /**
     * These tests validate the configuration by reading the source code
     * and verifying that it uses the centralized constants.
     *
     * This ensures magic numbers have been properly extracted.
     */
    it('should import CONSTANTS module', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify the source imports CONSTANTS
      expect(sourceCode).toContain("require('../config/constants')");
    });

    it('apiLimiter should use CONSTANTS.RATE_LIMIT_WINDOW', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify apiLimiter uses the constant
      expect(sourceCode).toMatch(
        /const apiLimiter[\s\S]*?windowMs:\s*CONSTANTS\.RATE_LIMIT_WINDOW/
      );
    });

    it('apiLimiter should use CONSTANTS.API_RATE_LIMIT', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify apiLimiter uses the constant
      expect(sourceCode).toMatch(/const apiLimiter[\s\S]*?max:\s*CONSTANTS\.API_RATE_LIMIT/);
    });

    it('healthLimiter should use CONSTANTS.HEALTH_RATE_LIMIT', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify healthLimiter uses the constant
      expect(sourceCode).toMatch(/const healthLimiter[\s\S]*?max:\s*CONSTANTS\.HEALTH_RATE_LIMIT/);
    });

    it('both limiters should use standardHeaders: true', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Count occurrences of standardHeaders: true
      const matches = sourceCode.match(/standardHeaders:\s*true/g);
      expect(matches).toHaveLength(2); // Once for apiLimiter, once for healthLimiter
    });

    it('both limiters should use legacyHeaders: false', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Count occurrences of legacyHeaders: false
      const matches = sourceCode.match(/legacyHeaders:\s*false/g);
      expect(matches).toHaveLength(2); // Once for apiLimiter, once for healthLimiter
    });

    it('apiLimiter should have retry information in message', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify apiLimiter message contains retryAfter
      expect(sourceCode).toContain('retryAfter:');
      expect(sourceCode).toContain("'15 minutes'");
    });
  });

  describe('configuration integrity', () => {
    it('should have consistent configuration between limiters', () => {
      // This test verifies that both limiters share the same window duration
      // by checking they both use CONSTANTS.RATE_LIMIT_WINDOW
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Both should use the same constant
      const windowMatches = sourceCode.match(/windowMs:\s*CONSTANTS\.RATE_LIMIT_WINDOW/g);
      expect(windowMatches).toHaveLength(2);
    });

    it('healthLimiter max should be 3x apiLimiter max (verified via constants)', () => {
      const CONSTANTS = require('../../../src/config/constants');

      // Verify the relationship between the two limits
      expect(CONSTANTS.HEALTH_RATE_LIMIT).toBe(CONSTANTS.API_RATE_LIMIT * 3);
    });
  });
});
