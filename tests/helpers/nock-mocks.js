const nock = require('nock');

const IPAPI_BASE = 'https://ipapi.co';
const OPEN_METEO_BASE = 'https://api.open-meteo.com';

const MOCK_RESPONSES = {
  SUCCESS: {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country_name: 'United States',
    country_code: 'US',
    latitude: 37.4056,
    longitude: -122.0775,
    timezone: 'America/Los_Angeles',
    utc_offset: '-0800',
  },
  SECURITY: {
    ip: '203.0.113.1',
    city: 'Test City',
    region: 'Test Region',
    country_name: 'Test Country',
    country_code: 'TC',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    utc_offset: '-0500',
  },
  MINIMAL: { ip: '8.8.8.8' },
  EMPTY: {},
};

// options: { key, times, delay, delayConnection, persist }
function mockGeolocationSuccess(ip, response = MOCK_RESPONSES.SUCCESS, options = {}) {
  const path = ip ? `/${ip}/json/` : '/json/';
  const qs = options.key ? `?key=${options.key}` : '';
  let interceptor = nock(IPAPI_BASE).get(`${path}${qs}`);
  if (options.times) interceptor = interceptor.times(options.times);
  if (options.delayConnection) interceptor = interceptor.delayConnection(options.delayConnection);
  if (options.delay) interceptor = interceptor.delay(options.delay);
  const scope = interceptor.reply(200, response);
  if (options.persist) scope.persist();
  return scope;
}

function mockGeolocationError(ip, statusCode = 500, body = {}) {
  const path = ip ? `/${ip}/json/` : '/json/';
  return nock(IPAPI_BASE).get(path).reply(statusCode, body);
}

// options: { times, retryAfter, key }
function mockGeolocationRateLimit(ip, options = {}) {
  const path = ip ? `/${ip}/json/` : '/json/';
  const qs = options.key ? `?key=${options.key}` : '';
  const headers =
    options.retryAfter !== undefined ? { 'Retry-After': String(options.retryAfter) } : {};
  let interceptor = nock(IPAPI_BASE).get(`${path}${qs}`);
  if (options.times) interceptor = interceptor.times(options.times);
  return interceptor.reply(429, { error: 'Rate limited' }, headers);
}

// error: string error code, Error instance, or plain object — nock v14 requires a real Error
function mockGeolocationNetworkError(ip, error) {
  const path = ip ? `/${ip}/json/` : '/json/';
  let errorArg;
  if (typeof error === 'string') {
    errorArg = Object.assign(new Error(error), { code: error });
  } else if (error instanceof Error) {
    errorArg = error;
  } else {
    errorArg = Object.assign(new Error(error.code || 'Unknown'), error);
  }
  return nock(IPAPI_BASE).get(path).replyWithError(errorArg);
}

// Regex path match used by security tests; persisted by default
function mockGeolocationRegex(response = MOCK_RESPONSES.SECURITY, persist = true) {
  const scope = nock(IPAPI_BASE)
    .get(/\/.*\/json\//)
    .reply(200, response);
  if (persist) scope.persist();
  return scope;
}

function cleanMocks() {
  nock.cleanAll();
}

const MOCK_WEATHER_RESPONSE = {
  latitude: 37.4056,
  longitude: -122.0775,
  current_units: {
    temperature_2m: '°C',
    weather_code: 'wmo code',
    wind_speed_10m: 'mp/h',
    relative_humidity_2m: '%',
  },
  current: {
    temperature_2m: 18.5,
    weather_code: 1,
    wind_speed_10m: 5.2,
    relative_humidity_2m: 65,
  },
};

function mockWeatherSuccess(lat, lng, overrides = {}) {
  const response = {
    ...MOCK_WEATHER_RESPONSE,
    latitude: lat,
    longitude: lng,
    current: { ...MOCK_WEATHER_RESPONSE.current, ...overrides },
  };
  return nock(OPEN_METEO_BASE).get('/v1/forecast').query(true).reply(200, response);
}

function mockWeatherError(lat, lng, statusCode = 500) {
  return nock(OPEN_METEO_BASE)
    .get('/v1/forecast')
    .query(true)
    .reply(statusCode, { error: 'upstream error' });
}

module.exports = {
  MOCK_RESPONSES,
  MOCK_WEATHER_RESPONSE,
  mockGeolocationSuccess,
  mockGeolocationError,
  mockGeolocationRateLimit,
  mockGeolocationNetworkError,
  mockGeolocationRegex,
  mockWeatherSuccess,
  mockWeatherError,
  cleanMocks,
};
