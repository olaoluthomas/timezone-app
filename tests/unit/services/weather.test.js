const nock = require('nock');
const { getWeather, clearWeatherCache } = require('../../../src/services/weather');
const { mockWeatherSuccess, mockWeatherError, cleanMocks } = require('../../helpers/nock-mocks');

describe('WeatherService', () => {
  beforeEach(() => {
    clearWeatherCache();
    cleanMocks();
  });
  afterAll(() => nock.restore());

  describe('getWeather', () => {
    test('should return weather data for valid coordinates', async () => {
      mockWeatherSuccess(37.4056, -122.0775);

      const result = await getWeather(37.4056, -122.0775);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('temperature', 18.5);
      expect(result).toHaveProperty('temperatureUnit', '°C');
      expect(result).toHaveProperty('condition', 'Mainly clear');
      expect(result).toHaveProperty('windSpeed', 5.2);
      expect(result).toHaveProperty('humidity', 65);
      expect(result.cached).toBe(false);
    });

    test('should return cached result on second call without hitting network', async () => {
      mockWeatherSuccess(37.4056, -122.0775);

      await getWeather(37.4056, -122.0775);
      // No nock registered for this call — would throw if network were hit
      const result = await getWeather(37.4056, -122.0775);

      expect(result).not.toBeNull();
      expect(result.cached).toBe(true);
      expect(result).toHaveProperty('temperature', 18.5);
    });

    test('should cache different coordinates independently', async () => {
      mockWeatherSuccess(37.4056, -122.0775);
      mockWeatherSuccess(40.7128, -74.006);

      const result1 = await getWeather(37.4056, -122.0775);
      const result2 = await getWeather(40.7128, -74.006);

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
    });

    test('should return null on API error response', async () => {
      mockWeatherError(37.4056, -122.0775, 500);

      const result = await getWeather(37.4056, -122.0775);

      expect(result).toBeNull();
    });

    test('should return null on network error', async () => {
      nock('https://api.open-meteo.com')
        .get('/v1/forecast')
        .query(true)
        .replyWithError(Object.assign(new Error('ECONNREFUSED'), { code: 'ECONNREFUSED' }));

      const result = await getWeather(37.4056, -122.0775);

      expect(result).toBeNull();
    });

    test('should map known WMO weather codes to descriptions', async () => {
      mockWeatherSuccess(37.4056, -122.0775, { weather_code: 95 });

      const result = await getWeather(37.4056, -122.0775);

      expect(result.condition).toBe('Thunderstorm');
    });

    test('should return "Unknown" for unrecognised weather codes', async () => {
      mockWeatherSuccess(37.4056, -122.0775, { weather_code: 999 });

      const result = await getWeather(37.4056, -122.0775);

      expect(result.condition).toBe('Unknown');
    });
  });
});
