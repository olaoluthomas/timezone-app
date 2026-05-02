const nock = require('nock');

const IPAPI_BASE = 'https://ipapi.co';

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

// error: string error code or Error/object passed directly to replyWithError
function mockGeolocationNetworkError(ip, error) {
  const path = ip ? `/${ip}/json/` : '/json/';
  const errorArg = typeof error === 'string' ? { code: error } : error;
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

module.exports = {
  MOCK_RESPONSES,
  mockGeolocationSuccess,
  mockGeolocationError,
  mockGeolocationRateLimit,
  mockGeolocationNetworkError,
  mockGeolocationRegex,
  cleanMocks,
};
