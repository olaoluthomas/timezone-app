const { getTimezone } = require('../../../src/controllers/timezoneController');
const { APIError } = require('../../../src/middleware/error-handler');
const geolocationService = require('../../../src/services/geolocation');
const weatherService = require('../../../src/services/weather');

jest.mock('../../../src/services/geolocation');
jest.mock('../../../src/services/weather');
// error-handler uses config and logger; mock both to keep unit test isolated
jest.mock('../../../src/config', () => ({ isDevelopment: false }));
jest.mock('../../../src/utils/logger', () => ({ error: jest.fn(), warn: jest.fn() }));

const MOCK_TIMEZONE_RESULT = {
  ip: '8.8.8.8',
  city: 'Mountain View',
  timezone: 'America/Los_Angeles',
  currentTime: '2026-01-01T12:00:00-08:00',
  latitude: 37.4056,
  longitude: -122.0775,
  cached: false,
};

describe('Timezone Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    weatherService.getWeather.mockResolvedValue(null);
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
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(MOCK_TIMEZONE_RESULT));
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
    test('calls next(APIError) with 503 when timeout fires', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);

      res._timeoutCb();

      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      const apiErr = next.mock.calls[0][0];
      expect(apiErr.statusCode).toBe(503);
      expect(apiErr.details.retryAfter).toBe(60);
    });

    test('timeout APIError has correct message', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);

      res._timeoutCb();

      const apiErr = next.mock.calls[0][0];
      expect(apiErr.message).toBe('Geolocation service temporarily unavailable');
    });

    test('does not call next on timeout if headers already sent', async () => {
      geolocationService.getTimezoneByIP.mockResolvedValue(MOCK_TIMEZONE_RESULT);
      await getTimezone(req, res, next);

      res.headersSent = true;
      res._timeoutCb();

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('calls next(error) for generic errors', async () => {
      const err = new Error('Network failure');
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('calls next(APIError) for rate-limited errors', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(APIError));
    });

    test('rate-limited APIError has statusCode 503 and retryAfter', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      const apiErr = next.mock.calls[0][0];
      expect(apiErr.statusCode).toBe(503);
      expect(apiErr.details.retryAfter).toBe(60);
    });

    test('rate-limited APIError has correct message', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      const apiErr = next.mock.calls[0][0];
      expect(apiErr.message).toBe('Geolocation service temporarily unavailable');
    });

    test('does not respond directly for rate-limited errors (delegated to error handler)', async () => {
      const err = Object.assign(new Error('rate limited'), { rateLimited: true });
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      await getTimezone(req, res, next);
      expect(res.json).not.toHaveBeenCalled();
    });

    test('does not respond or call next if headers already sent on error', async () => {
      const err = new Error('Network failure');
      geolocationService.getTimezoneByIP.mockRejectedValue(err);
      res.headersSent = true;
      await getTimezone(req, res, next);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
