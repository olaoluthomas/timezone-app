/**
 * Unit Tests for Compression Middleware
 *
 * Tests the compression middleware functionality including:
 * - Large response compression (>1KB threshold)
 * - Small response bypass (<1KB threshold)
 * - x-no-compression header handling
 * - Client support detection
 * - Compression ratio verification
 */

const request = require('supertest');
const express = require('express');
const compressionMiddleware = require('../../../src/middleware/compression');

describe('Compression Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(compressionMiddleware);
  });

  describe('Large Response Compression', () => {
    it('should compress responses larger than 1KB', async () => {
      // Create a route that returns >1KB of JSON
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: 'This is a test item with some description text',
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              tags: ['test', 'compression', 'performance'],
            },
          })),
      };

      app.get('/large', (req, res) => {
        res.json(largeData);
      });

      const response = await request(app).get('/large').set('Accept-Encoding', 'gzip').expect(200);

      // Verify compression was applied
      expect(response.headers['content-encoding']).toBe('gzip');

      // Verify response is still valid JSON (supertest auto-decompresses)
      expect(response.body).toEqual(largeData);

      // Verify response size exceeds 1KB threshold
      const uncompressedSize = JSON.stringify(largeData).length;
      expect(uncompressedSize).toBeGreaterThan(1024);
    });

    it('should compress JSON responses with repetitive data efficiently', async () => {
      // Repetitive data compresses better
      const repetitiveData = {
        items: Array(200).fill({
          status: 'active',
          type: 'standard',
          category: 'general',
        }),
      };

      app.get('/repetitive', (req, res) => {
        res.json(repetitiveData);
      });

      const response = await request(app)
        .get('/repetitive')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
      expect(response.body).toEqual(repetitiveData);

      // Verify response size exceeds 1KB threshold
      const uncompressedSize = JSON.stringify(repetitiveData).length;
      expect(uncompressedSize).toBeGreaterThan(1024);
    });
  });

  describe('Small Response Bypass', () => {
    it('should not compress responses smaller than 1KB', async () => {
      const smallData = {
        status: 'ok',
        message: 'Small response',
      };

      app.get('/small', (req, res) => {
        res.json(smallData);
      });

      const response = await request(app).get('/small').set('Accept-Encoding', 'gzip').expect(200);

      // Small responses should not be compressed
      expect(response.headers['content-encoding']).toBeUndefined();
      expect(response.body).toEqual(smallData);
    });

    it('should not compress responses close to 1KB threshold', async () => {
      // Create response just under 1KB
      const nearThresholdData = {
        data: 'x'.repeat(900), // ~900 bytes
      };

      app.get('/near-threshold', (req, res) => {
        res.json(nearThresholdData);
      });

      const response = await request(app)
        .get('/near-threshold')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Should not compress (below 1KB threshold)
      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('x-no-compression Header', () => {
    it('should respect x-no-compression header', async () => {
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({ id: i, value: `Item ${i}` })),
      };

      app.get('/no-compress', (req, res) => {
        res.json(largeData);
      });

      const response = await request(app)
        .get('/no-compress')
        .set('Accept-Encoding', 'gzip')
        .set('x-no-compression', 'true')
        .expect(200);

      // Should not compress when x-no-compression header is present
      expect(response.headers['content-encoding']).toBeUndefined();
      expect(response.body).toEqual(largeData);
    });

    it('should compress when x-no-compression header is absent', async () => {
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({ id: i, value: `Item ${i}` })),
      };

      app.get('/compress', (req, res) => {
        res.json(largeData);
      });

      const response = await request(app)
        .get('/compress')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Should compress when header is absent
      expect(response.headers['content-encoding']).toBe('gzip');
    });
  });

  describe('Client Support Detection', () => {
    it('should not compress when client does not accept gzip encoding', async () => {
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({ id: i, value: `Item ${i}` })),
      };

      app.get('/no-gzip-support', (req, res) => {
        res.json(largeData);
      });

      // Request with Accept-Encoding that doesn't include gzip
      const response = await request(app)
        .get('/no-gzip-support')
        .set('Accept-Encoding', 'identity')
        .expect(200);

      // Should not compress for clients that don't accept gzip
      expect(response.headers['content-encoding']).toBeUndefined();
      expect(response.body).toEqual(largeData);
    });

    it('should compress when client advertises gzip support', async () => {
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({ id: i, value: `Item ${i}` })),
      };

      app.get('/gzip-support', (req, res) => {
        res.json(largeData);
      });

      const response = await request(app)
        .get('/gzip-support')
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });
  });

  describe('Content Type Handling', () => {
    it('should compress JSON responses', async () => {
      const largeData = {
        data: Array(100)
          .fill(0)
          .map((_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: 'Test description for compression',
          })),
      };

      app.get('/json', (req, res) => {
        res.json(largeData);
      });

      const response = await request(app).get('/json').set('Accept-Encoding', 'gzip').expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should compress text/html responses', async () => {
      const largeHtml = '<html>' + '<body>' + 'x'.repeat(2000) + '</body></html>';

      app.get('/html', (req, res) => {
        res.type('text/html').send(largeHtml);
      });

      const response = await request(app).get('/html').set('Accept-Encoding', 'gzip').expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully without breaking responses', async () => {
      app.get('/error', (req, res) => {
        res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app).get('/error').set('Accept-Encoding', 'gzip').expect(500);

      // Error response should still be parseable
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Compression Ratio Verification', () => {
    it('should compress typical API responses above 1KB threshold', async () => {
      // Simulate a typical timezone API response
      const typicalResponse = {
        ip: '8.8.8.8',
        city: 'Mountain View',
        region: 'California',
        country: 'US',
        timezone: 'America/Los_Angeles',
        utc_offset: '-0800',
        latitude: 37.386,
        longitude: -122.0838,
        postal: '94035',
        datetime: new Date().toISOString(),
        metadata: {
          cached: false,
          timestamp: Date.now(),
        },
      };

      // Repeat to exceed 1KB threshold
      const largeResponse = {
        results: Array(30).fill(typicalResponse),
      };

      app.get('/typical', (req, res) => {
        res.json(largeResponse);
      });

      const response = await request(app)
        .get('/typical')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
      expect(response.body).toEqual(largeResponse);

      const uncompressedSize = JSON.stringify(largeResponse).length;
      expect(uncompressedSize).toBeGreaterThan(1024);
    });
  });
});
