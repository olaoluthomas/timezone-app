const { getTimezone } = require('../../../src/controllers/timezoneController');
const geolocationService = require('../../../src/services/geolocation');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/services/geolocation');
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

const MOCK_TIMEZONE_RESULT = {
  ip: '8.8.8.8',
  city: 'Mountain View',
  timezone: 'America/Los_Angeles',
  currentTime: '2026-01-01T12:00:00-08:00',
  cached: false,
};

describe('Timezone Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { ip: '8.8.8.8' };
    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
      on: jest.fn((event, cb) => {
        if (event === 'timeout') res._timeoutCb = cb;
      }),
    };
    next = jest.fn();
  });

  describe('getTimezone', () => {
    test('calls getTimezoneByIP with req.ip', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);
      expect(geolocationService.getTimezoneByIP).toHaveBeenCalledWith('8.8.8.8');
    });

    test('responds with the timezone result', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);
      expect(res.json).toHaveBeenCalledWith(MOCK_TIMEZONE_RESULT);
    });

    test('registers timeout listener on res', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);
      expect(res.on).toHaveBeenCalledWith('timeout', expect.any(Function));
    });

    test('does not call next on success', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('timeout handling', () => {
    test('sends 503 with Retry-After when timeout fires', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);

      res._timeoutCb();

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.set).toHaveBeenCalledWith('Retry-After', '60');
      expect(res.json).toHaveBeenCalledWith({
        error: 'Geolocation service temporarily unavailable',
      });
    });

    test('does not double-send if headers already sent on timeout', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);

      res.headersSent = true;
      res._timeoutCb();

      expect(res.status).not.toHaveBeenCalledWith(503);
    });
  });

  describe('error handling', () => {
    test('calls next(error) for generic errors', async () => {
      const err = new Error('Network failure');
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('logs error for generic failures', async () => {
      const err = new Error('Network failure');
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(
        'Timezone API error',
        expect.objectContaining({ error: 'Network failure', ip: '8.8.8.8' })
      );
    });

    test('returns 503 with Retry-After for rate-limited errors', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.set).toHaveBeenCalledWith('Retry-After', '60');
    });

    test('rate-limited response body has correct error message', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Geolocation service temporarily unavailable',
      });
    });

    test('does not call next for rate-limited errors', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    test('does not respond if headers already sent on error', async () => {
      const err = new Error('Network failure');
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      res.headersSent = true;
      await getTimezone(req, res, next);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
