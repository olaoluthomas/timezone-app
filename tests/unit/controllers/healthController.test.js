const { getLiveness, getReadiness } = require('../../../src/controllers/healthController');
const healthService = require('../../../src/services/health');

jest.mock('../../../src/services/health');

const HEALTHY_RESULT = {
  status: 'healthy',
  timestamp: '2026-01-01T00:00:00.000Z',
  uptime: 100,
  checks: {
    geolocationAPI: { status: 'healthy' },
    cache: { status: 'healthy' },
  },
  responseTime: '10ms',
};

const DEGRADED_RESULT = { ...HEALTHY_RESULT, status: 'degraded' };

describe('Health Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getLiveness', () => {
    test('responds with status 200', async () => {
      await getLiveness(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('response body contains status ok', async () => {
      await getLiveness(req, res, next);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
    });

    test('response body contains timestamp', async () => {
      await getLiveness(req, res, next);
      const body = res.json.mock.calls[0][0];
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('response body contains uptime', async () => {
      await getLiveness(req, res, next);
      const body = res.json.mock.calls[0][0];
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('does not call next', async () => {
      await getLiveness(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getReadiness', () => {
    test('calls performHealthCheck', async () => {
      healthService.performHealthCheck.mockResolvedValue(HEALTHY_RESULT);
      await getReadiness(req, res, next);
      expect(healthService.performHealthCheck).toHaveBeenCalledTimes(1);
    });

    test('responds with 200 when healthy', async () => {
      healthService.performHealthCheck.mockResolvedValue(HEALTHY_RESULT);
      await getReadiness(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('responds with 503 when degraded', async () => {
      healthService.performHealthCheck.mockResolvedValue(DEGRADED_RESULT);
      await getReadiness(req, res, next);
      expect(res.status).toHaveBeenCalledWith(503);
    });

    test('response body is the health check result', async () => {
      healthService.performHealthCheck.mockResolvedValue(HEALTHY_RESULT);
      await getReadiness(req, res, next);
      expect(res.json).toHaveBeenCalledWith(HEALTHY_RESULT);
    });

    test('response body for degraded includes checks detail', async () => {
      healthService.performHealthCheck.mockResolvedValue(DEGRADED_RESULT);
      await getReadiness(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ checks: expect.any(Object) })
      );
    });

    test('calls next(error) when performHealthCheck throws', async () => {
      const err = new Error('unexpected failure');
      healthService.performHealthCheck.mockRejectedValue(err);
      await getReadiness(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('does not send response when performHealthCheck throws', async () => {
      healthService.performHealthCheck.mockRejectedValue(new Error('fail'));
      await getReadiness(req, res, next);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
