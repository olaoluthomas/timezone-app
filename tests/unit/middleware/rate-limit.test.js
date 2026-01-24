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
     * and verifying that values match the expected configuration.
     *
     * This approach tests configuration without relying on internal
     * express-rate-limit implementation details.
     */
    it('apiLimiter should have 15-minute window (900000ms)', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify the source contains the correct windowMs value
      expect(sourceCode).toContain('15 * 60 * 1000');
    });

    it('apiLimiter should have max 100 requests', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify apiLimiter has max: 100
      const apiLimiterMatch = sourceCode.match(/const apiLimiter[\s\S]*?max:\s*(\d+)/);
      expect(apiLimiterMatch).not.toBeNull();
      expect(parseInt(apiLimiterMatch[1])).toBe(100);
    });

    it('healthLimiter should have max 300 requests', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Verify healthLimiter has max: 300
      const healthLimiterMatch = sourceCode.match(/const healthLimiter[\s\S]*?max:\s*(\d+)/);
      expect(healthLimiterMatch).not.toBeNull();
      expect(parseInt(healthLimiterMatch[1])).toBe(300);
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
      // by checking they both use "15 * 60 * 1000"
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      // Both should use the same window calculation
      const windowMatches = sourceCode.match(/windowMs:\s*15\s*\*\s*60\s*\*\s*1000/g);
      expect(windowMatches).toHaveLength(2);
    });

    it('healthLimiter max should be 3x apiLimiter max (300 vs 100)', () => {
      const fs = require('fs');
      const path = require('path');
      const sourceCode = fs.readFileSync(
        path.join(__dirname, '../../../src/middleware/rate-limit.js'),
        'utf-8'
      );

      const apiMax = sourceCode.match(/const apiLimiter[\s\S]*?max:\s*(\d+)/)[1];
      const healthMax = sourceCode.match(/const healthLimiter[\s\S]*?max:\s*(\d+)/)[1];

      expect(parseInt(healthMax)).toBe(parseInt(apiMax) * 3);
    });
  });
});
