const request = require('supertest');
const nock = require('nock');
const app = require('../../../src/app');

describe('Health Check Endpoints', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('GET /health', () => {
    test('should return 200 with health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('should return correct content-type', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should respond quickly', async () => {
      const startTime = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast
    });

    test('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    test('should return positive uptime', async () => {
      const response = await request(app).get('/health');

      expect(response.body.uptime).toBeGreaterThan(0);
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /health/ready', () => {
    test('should return 200 when all dependencies healthy', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, { ip: '8.8.8.8' });

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    test('should return 503 when API is down', async () => {
      nock('https://ipapi.co').get('/json/').reply(500, {});

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('degraded');
    });

    test('should include detailed check results', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, {});

      const response = await request(app).get('/health/ready');

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('geolocationAPI');
      expect(response.body.checks).toHaveProperty('cache');
    });

    test('should include response time metrics', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, {});

      const response = await request(app).get('/health/ready');

      expect(response.body).toHaveProperty('responseTime');
      expect(response.body.responseTime).toMatch(/\d+ms/);
      expect(response.body.checks.geolocationAPI).toHaveProperty('responseTime');
    });

    test('should handle API timeout gracefully', async () => {
      nock('https://ipapi.co').get('/json/').delayConnection(3000).reply(200, {});

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body.checks.geolocationAPI.status).toBe('unhealthy');
    });

    test('should handle network errors', async () => {
      nock('https://ipapi.co').get('/json/').replyWithError({ code: 'ENOTFOUND' });

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body.checks.geolocationAPI.error).toBeDefined();
    });

    test('should complete within acceptable time', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, {});

      const startTime = Date.now();
      await request(app).get('/health/ready');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2500);
    });

    test('should include timestamp and uptime', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, {});

      const response = await request(app).get('/health/ready');

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should show cache statistics when healthy', async () => {
      nock('https://ipapi.co').get('/json/').reply(200, {});

      const response = await request(app).get('/health/ready');

      expect(response.body.checks.cache).toHaveProperty('keys');
      expect(response.body.checks.cache).toHaveProperty('hitRate');
    });

    test('should handle multiple simultaneous requests', async () => {
      nock('https://ipapi.co').get('/json/').times(3).reply(200, {});

      const requests = [
        request(app).get('/health/ready'),
        request(app).get('/health/ready'),
        request(app).get('/health/ready'),
      ];

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });
  });

  describe('Health Endpoints Error Handling', () => {
    test('/health should never return error even if other issues exist', async () => {
      // Simulate some external issue
      nock('https://ipapi.co').get('/json/').reply(500, {});

      const response = await request(app).get('/health');

      // /health should still return 200
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    test('/health/ready should catch unexpected errors', async () => {
      // Don't mock anything - let it fail naturally
      nock('https://ipapi.co').get('/json/').replyWithError(new Error('Catastrophic failure'));

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'degraded');
      expect(response.body.checks.geolocationAPI.status).toBe('unhealthy');
      expect(response.body.checks.geolocationAPI.message).toContain('error');
    });
  });
});
