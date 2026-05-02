const nock = require('nock');
const { cleanMocks } = require('./nock-mocks');

function setupGeolocationTests(clearCacheFn) {
  beforeEach(() => {
    clearCacheFn();
    cleanMocks();
  });
  afterAll(() => nock.restore());
}

function setupIntegrationTests() {
  beforeEach(() => cleanMocks());
  afterAll(() => nock.restore());
}

// Security tests use afterEach (not afterAll) because mocks are re-registered each beforeEach
function setupSecurityTests() {
  afterEach(() => cleanMocks());
}

module.exports = { setupGeolocationTests, setupIntegrationTests, setupSecurityTests };
