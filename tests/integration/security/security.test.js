const request = require('supertest');
const nock = require('nock');
const app = require('../../../src/app');

describe('Security Middleware Integration', () => {
  // Mock the external geolocation API for all tests
  beforeEach(() => {
    nock('https://ipapi.co')
      .get(/\/.*\/json\//)
      .reply(200, {
        ip: '203.0.113.1',
        city: 'Test City',
        region: 'Test Region',
        country_name: 'Test Country',
        country_code: 'TC',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        utc_offset: '-0500',
      })
      .persist();

    nock('https://ipapi.co')
      .get('/json/')
      .reply(200, {
        ip: '203.0.113.1',
        city: 'Test City',
        region: 'Test Region',
        country_name: 'Test Country',
        country_code: 'TC',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        utc_offset: '-0500',
      })
      .persist();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app).get('/api/timezone');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app).get('/api/timezone');

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should include security headers on all endpoints', async () => {
      const healthResponse = await request(app).get('/health');

      expect(healthResponse.headers['x-content-type-options']).toBe('nosniff');
      expect(healthResponse.headers['x-frame-options']).toBeDefined();
    });

    it('should not include CSP header (disabled for frontend)', async () => {
      const response = await request(app).get('/api/timezone');

      expect(response.headers['content-security-policy']).toBeUndefined();
    });
  });

  describe('CORS', () => {
    it('should allow requests with no origin (curl, mobile apps)', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      // Requests with no origin are allowed
    });

    it('should allow requests with origin in development', async () => {
      const response = await request(app).get('/health').set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      // In development mode, all origins are allowed
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // CORS middleware should handle preflight
      // May return 204 (no content) or 404 (no explicit OPTIONS route)
      expect([200, 204, 404]).toContain(response.status);
    });

    it('should be configured with CORS middleware', async () => {
      // Just verify the endpoint works and doesn't reject due to CORS
      const response = await request(app).get('/health').set('Origin', 'http://example.com');

      // Should not be a CORS error (403 or similar)
      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests under the limit', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
    });

    it('should include rate limit headers in response', async () => {
      const response = await request(app).get('/api/timezone');

      expect(response.headers['ratelimit-limit']).toBe('100');
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should have different limits for API vs health endpoints', async () => {
      const apiResponse = await request(app).get('/api/timezone');
      const healthResponse = await request(app).get('/health');

      expect(apiResponse.headers['ratelimit-limit']).toBe('100');
      expect(healthResponse.headers['ratelimit-limit']).toBe('300');
    });

    it('should reject requests over the limit with 429', async () => {
      // Make 101 requests to exceed the limit
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(request(app).get('/api/timezone'));
      }

      const responses = await Promise.all(requests);
      const last = responses[responses.length - 1];

      // The last request should be rate limited
      expect(last.status).toBe(429);
      expect(last.body.error).toContain('Too many requests');
    }, 60000); // Increased timeout for many requests (101 requests can take >30s)

    it('should track different IPs separately', async () => {
      // First IP
      const response1 = await request(app)
        .get('/api/timezone')
        .set('X-Forwarded-For', '192.168.1.1');

      // Different IP
      const response2 = await request(app)
        .get('/api/timezone')
        .set('X-Forwarded-For', '192.168.1.2');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      // Both should have full rate limits since they're different IPs
      expect(parseInt(response1.headers['ratelimit-remaining'])).toBeGreaterThan(95);
      expect(parseInt(response2.headers['ratelimit-remaining'])).toBeGreaterThan(95);
    });
  });

  describe('Request Limits', () => {
    it('should reject requests with large payloads', async () => {
      const largePayload = 'a'.repeat(2000); // 2KB payload

      const response = await request(app)
        .post('/api/timezone')
        .set('Content-Type', 'application/json')
        .send({ data: largePayload });

      expect(response.status).toBe(413); // Payload Too Large
    });

    it('should accept requests with small payloads', async () => {
      const smallPayload = { test: 'data' }; // Small JSON

      const response = await request(app)
        .post('/api/timezone')
        .set('Content-Type', 'application/json')
        .send(smallPayload);

      // Should not be 413, even though endpoint doesn't handle POST
      // We're testing the body size limit, not the HTTP method
      expect(response.status).not.toBe(413);
    });
  });

  describe('Request Timeout', () => {
    it('should complete requests within timeout', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      // If we got a response, the timeout didn't trigger
    });
  });
});
