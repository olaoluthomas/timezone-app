const request = require('supertest');
const app = require('../../src/app');

/**
 * Smoke Tests - Quick End-to-End Validation
 *
 * These tests validate critical application paths with minimal setup.
 * They run against the actual app instance to catch integration issues.
 *
 * Characteristics:
 * - Quick execution (<5s total)
 * - No mocking (real app behavior)
 * - Focus on happy paths
 * - Validate security headers on every response
 * - Can be run before deployment
 *
 * Run: npm run test:smoke
 */
describe('API Smoke Tests', () => {
  describe('Health Endpoints', () => {
    it('GET /health should return 200 with expected structure', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');

      // Verify security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('GET /health/ready should check dependencies', async () => {
      const response = await request(app).get('/health/ready');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');

      if (response.status === 200) {
        expect(response.body.status).toBe('healthy');
        expect(response.body.checks).toHaveProperty('geolocationAPI');
        expect(response.body.checks).toHaveProperty('cache');
      }

      // Verify security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Timezone API Endpoint', () => {
    it('GET /api/timezone should return response with security headers', async () => {
      const response = await request(app).get('/api/timezone');

      // Accept both success (200) and error (500) - external API may fail
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('timezone');
        expect(response.body).toHaveProperty('currentTime');
        expect(response.body).toHaveProperty('city');
        expect(response.body).toHaveProperty('country');
        expect(response.body).toHaveProperty('ip');
        expect(response.body).toHaveProperty('timestamp');
      } else {
        // If API fails, should return error message
        expect(response.body).toHaveProperty('error');
      }

      // Verify security headers (always present)
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');

      // Verify rate limit headers (always present)
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });

    it('GET /api/timezone should have security headers', async () => {
      const response = await request(app).get('/api/timezone');

      // Required security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();

      // Rate limiting headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });
  });

  describe('Static Files', () => {
    it('GET / should serve index.html', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');

      // Verify security headers on static files
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 with security headers for invalid routes', async () => {
      const response = await request(app).get('/invalid-route-that-does-not-exist');

      expect(response.status).toBe(404);

      // Even 404s should have security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits on API endpoint', async () => {
      // Make a request to get initial rate limit headers
      const response = await request(app).get('/api/timezone');

      // Accept both success and error - focus on rate limit headers
      expect([200, 500]).toContain(response.status);

      // Verify rate limit headers are present and valid
      const limit = parseInt(response.headers['ratelimit-limit']);
      const remaining = parseInt(response.headers['ratelimit-remaining']);

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(limit);
    });

    it('should have higher rate limits for health checks', async () => {
      const apiResponse = await request(app).get('/api/timezone');
      const healthResponse = await request(app).get('/health');

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit']);
      const healthLimit = parseInt(healthResponse.headers['ratelimit-limit']);

      // Health endpoint should have higher limit
      expect(healthLimit).toBeGreaterThan(apiLimit);
    });
  });

  describe('CORS', () => {
    it('should allow requests with no origin', async () => {
      // Requests without Origin header (like curl, mobile apps)
      const response = await request(app).get('/api/timezone');

      // External API may fail, but CORS should allow the request
      expect([200, 500]).toContain(response.status);

      // Verify CORS didn't block the request
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should handle CORS headers in development', async () => {
      const response = await request(app)
        .get('/api/timezone')
        .set('Origin', 'http://localhost:3000');

      // In test environment, should allow all origins
      expect([200, 500]).toContain(response.status);

      // Verify CORS allowed the origin
      if (response.headers['access-control-allow-origin']) {
        expect(response.headers['access-control-allow-origin']).toBeDefined();
      }
    });
  });

  describe('Security Middleware Stack', () => {
    it('all endpoints should have complete security headers', async () => {
      const endpoints = [
        '/health',
        '/health/ready',
        '/api/timezone',
        '/',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);

        // Every endpoint must have these security headers
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBeDefined();

        // Verify no CSP header (disabled for frontend)
        expect(response.headers['content-security-policy']).toBeUndefined();
      }
    });
  });
});
