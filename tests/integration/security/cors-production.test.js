const request = require('supertest');
const express = require('express');

/**
 * CORS Production Environment Integration Tests
 *
 * These tests verify CORS behavior in production mode with different
 * ALLOWED_ORIGINS configurations. They execute the actual middleware
 * to achieve full code coverage of cors.js lines 21-29.
 */
describe('CORS Production Mode Integration', () => {
  let originalEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = {
      NODE_ENV: process.env.NODE_ENV,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    };
  });

  afterAll(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv.NODE_ENV;
    process.env.ALLOWED_ORIGINS = originalEnv.ALLOWED_ORIGINS;
  });

  afterEach(() => {
    // Clear module cache to reload middleware with new env
    jest.resetModules();
  });

  describe('production with specific allowed origins', () => {
    it('should allow whitelisted origin', async () => {
      // Set production environment with whitelist
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://app.example.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
    });

    it('should reject non-whitelisted origin', async () => {
      // Set production environment with whitelist
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://evil.com');

      // CORS should reject the request
      expect(response.status).not.toBe(200);
    });

    it('should allow multiple whitelisted origins (comma-separated)', async () => {
      // Set production environment with multiple origins
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS =
        'https://app1.example.com,https://app2.example.com,https://app3.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      // Test each allowed origin
      const response1 = await request(app).get('/test').set('Origin', 'https://app1.example.com');

      const response2 = await request(app).get('/test').set('Origin', 'https://app2.example.com');

      const response3 = await request(app).get('/test').set('Origin', 'https://app3.example.com');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);

      expect(response1.headers['access-control-allow-origin']).toBe('https://app1.example.com');
      expect(response2.headers['access-control-allow-origin']).toBe('https://app2.example.com');
      expect(response3.headers['access-control-allow-origin']).toBe('https://app3.example.com');
    });

    it('should reject origin not in comma-separated list', async () => {
      // Set production environment with multiple origins
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app1.com,https://app2.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://evil.com');

      expect(response.status).not.toBe(200);
    });
  });

  describe('production with wildcard allowed origins', () => {
    it('should allow all origins when ALLOWED_ORIGINS="*"', async () => {
      // Set production environment with wildcard
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = '*';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://any-domain.com');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('https://any-domain.com');
    });

    it('should allow any origin when wildcard is in the list', async () => {
      // Set production environment with wildcard in list
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://specific.com,*';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://random-domain.com');

      expect(response.status).toBe(200);
    });
  });

  describe('production with empty allowed origins', () => {
    it('should reject all origins when ALLOWED_ORIGINS is empty', async () => {
      // Set production environment with empty whitelist
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = '';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://any-domain.com');

      expect(response.status).not.toBe(200);
    });

    it('should reject all origins when ALLOWED_ORIGINS is undefined', async () => {
      // Set production environment without ALLOWED_ORIGINS
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOWED_ORIGINS;

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test').set('Origin', 'https://any-domain.com');

      expect(response.status).not.toBe(200);
    });
  });

  describe('production with no origin header', () => {
    it('should allow requests with no origin (mobile apps, curl)', async () => {
      // Set production environment
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      // Request without Origin header (like curl, mobile apps)
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
    });
  });

  describe('CORS preflight in production', () => {
    it('should handle OPTIONS preflight for whitelisted origin', async () => {
      // Set production environment
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .options('/test')
        .set('Origin', 'https://app.example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should reject OPTIONS preflight for non-whitelisted origin', async () => {
      // Set production environment
      process.env.NODE_ENV = 'production';
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      // Create test app with reloaded middleware
      const app = express();
      const corsMiddleware = require('../../../src/middleware/cors');
      app.use(corsMiddleware);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app)
        .options('/test')
        .set('Origin', 'https://evil.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).not.toBe(204);
    });
  });
});
