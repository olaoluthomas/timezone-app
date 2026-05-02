const nock = require('nock');
const { cleanMocks } = require('./nock-mocks');

function setupGeolocationTests(clearCacheFn) {
  beforeEach(async () => {
    clearCacheFn();
    cleanMocks();
    // nock v14 fires replyWithError() via setImmediate; drain the queue so the
    // error fires and exhausts within the current test boundary rather than
    // leaking into the next test under coverage instrumentation.
    await new Promise((resolve) => setImmediate(resolve));
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
