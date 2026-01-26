# Timezone Web App - Refactoring Status Update

**Analysis Date:** 2026-01-26
**Previous Analysis:** 2026-01-24
**Codebase Version:** Post-Winston Logger & Constants Extraction
**Total Files Analyzed:** 11 source files, 13 test files
**Original Opportunities:** 28
**Completed:** 3
**New Opportunities:** 8
**Updated Total:** 33 opportunities

---

## Executive Summary

Since the last analysis (2026-01-24), **significant progress** has been made:

### ✅ Completed Since Last Analysis (3 opportunities)

1. **Winston Logger Implementation** (Opportunity #1) - ✅ COMPLETE
   - Milestone 6 completed on 2026-01-25
   - All console.log statements replaced
   - Structured JSON logging with log levels
   - File transports with rotation
   - 95.83% test coverage for logger module

2. **Extract Magic Numbers to Constants** (Opportunity #2) - ✅ COMPLETE
   - Created `src/config/constants.js`
   - Comprehensive documentation
   - All timeouts, rate limits, and cache config centralized
   - Used throughout codebase

3. **Add Compression Middleware** (Opportunity #13) - ✅ COMPLETE
   - Created `src/middleware/compression.js`
   - Gzip compression for responses >1KB
   - 100% test coverage
   - 12 comprehensive tests

### 🚧 High Priority - Still Pending (5 opportunities)

- Consolidate IP validation logic (#3)
- Extract route handlers to controllers (#6)
- Add graceful shutdown handlers (#5) - Milestone 9
- Add error context to error messages (#7)
- Centralize configuration management (#8)

### 🆕 New Opportunities Identified (8)

- Extract test helper utilities for nock mocking
- Create shared test fixtures
- Add controller layer with dependency injection
- Implement centralized error handler middleware
- Add request/response logging middleware
- Extract timezone formatting utilities
- Add API response wrapper utilities
- Improve test organization with test helper directory

---

## 🎯 Updated Priority Matrix

### 🔴 Critical Priority (Now or Next Sprint)

#### 1. Add Graceful Shutdown Handler ⏳
**Status:** Planned (Milestone 9 - Next)
**Impact:** ⭐⭐⭐⭐⭐ (Production Stability)
**Effort:** 2 hours
**Previous ID:** #5

**Why Critical:**
- Required for Kubernetes/Docker deployments
- Prevents data loss during rolling updates
- Allows in-flight requests to complete
- Professional production requirement

**Current State:**
```javascript
// src/index.js:19-21 (NO graceful shutdown)
app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
});
```

**Target State:**
```javascript
const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});

function gracefulShutdown(signal) {
  logger.info('Shutdown signal received', { signal });

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
```

**Benefits:**
- Zero downtime deployments
- Data integrity during shutdown
- Better container orchestration
- Meets Milestone 9 requirements

---

### 🔴 HIGH PRIORITY (Current Sprint)

#### 2. Extract Route Handlers to Controllers
**Status:** Pending
**Impact:** ⭐⭐⭐⭐ (Code Organization, Testability)
**Effort:** 3 hours
**Previous ID:** #6

**Current Issues:**
- Route handlers inline in `app.js` (lines 72-108)
- Hard to unit test business logic
- app.js becoming large (110 lines)
- Business logic mixed with routing

**Affected Files:**
```
src/app.js:72-78   - Liveness probe handler
src/app.js:80-93   - Readiness probe handler
src/app.js:96-108  - Timezone API handler
```

**Proposed Solution:**
```javascript
// Create src/controllers/healthController.js
const healthService = require('../services/health');
const logger = require('../utils/logger');

async function getLiveness(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

async function getReadiness(req, res) {
  try {
    const healthStatus = await healthService.performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message,
    });
  }
}

module.exports = { getLiveness, getReadiness };

// Create src/controllers/timezoneController.js
const geolocationService = require('../services/geolocation');
const logger = require('../utils/logger');

async function getTimezone(req, res) {
  try {
    const clientIP = req.ip;
    const timezoneInfo = await geolocationService.getTimezoneByIP(clientIP);
    res.json(timezoneInfo);
  } catch (error) {
    logger.error('Timezone lookup failed', { ip: req.ip, error: error.message });
    res.status(500).json({ error: 'Failed to fetch timezone information' });
  }
}

module.exports = { getTimezone };

// In app.js - simplified routing
const healthController = require('./controllers/healthController');
const timezoneController = require('./controllers/timezoneController');

app.get('/health', healthLimiter, healthController.getLiveness);
app.get('/health/ready', healthLimiter, healthController.getReadiness);
app.get('/api/timezone', apiLimiter, timezoneController.getTimezone);
```

**Benefits:**
- Clean separation of concerns (routing vs business logic)
- Easy to unit test controllers
- app.js stays focused on configuration
- Follows MVC pattern
- Better code organization

**Testing Impact:**
- Add `tests/unit/controllers/` directory
- Test controllers independently with mocked services
- Existing integration tests remain unchanged

---

#### 3. Consolidate IP Validation Logic
**Status:** Pending
**Impact:** ⭐⭐⭐⭐ (Code Quality, Reusability)
**Effort:** 2 hours
**Previous ID:** #3

**Current Issues:**
- IP normalization logic duplicated in `geolocation.js`
- Localhost detection scattered (lines 81-82)
- Private IP detection inline (lines 84-87)
- Not reusable across modules

**Affected Files:**
```
src/services/geolocation.js:54-64  - normalizeIP logic
src/services/geolocation.js:81-82  - Localhost check
src/services/geolocation.js:84-87  - Private IP check
```

**Current Code (geolocation.js:54-87):**
```javascript
// Normalize IPv6-mapped IPv4 to pure IPv4
function normalizeIP(ip) {
  if (!ip) return ip;
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

const normalizedIP = normalizeIP(ip);

// Use public IP service for localhost or private IPs
let lookupIP = normalizedIP;
if (normalizedIP === '::1' || normalizedIP === '127.0.0.1') {
  lookupIP = ''; // ipapi.co will use their public IP
} else if (
  normalizedIP?.startsWith('10.') ||
  normalizedIP?.startsWith('192.168.') ||
  normalizedIP?.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
) {
  lookupIP = ''; // Use public IP lookup for private IPs
}
```

**Proposed Solution:**
```javascript
// Create src/utils/ip-validator.js
class IPValidator {
  /**
   * Normalize IPv6-mapped IPv4 to pure IPv4
   * @param {string} ip - IP address
   * @returns {string} Normalized IP
   */
  static normalizeIP(ip) {
    if (!ip) return ip;
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }

  /**
   * Check if IP is localhost
   * @param {string} ip - IP address
   * @returns {boolean}
   */
  static isLocalhost(ip) {
    return ip === '::1' || ip === '127.0.0.1' || ip?.startsWith('127.');
  }

  /**
   * Check if IP is private (RFC 1918)
   * @param {string} ip - IP address
   * @returns {boolean}
   */
  static isPrivateIP(ip) {
    if (!ip) return false;
    return (
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
    );
  }

  /**
   * Validate and determine lookup IP
   * @param {string} ip - Original IP address
   * @returns {Object} Validation result
   */
  static validate(ip) {
    const normalized = this.normalizeIP(ip);
    const isLocalhost = this.isLocalhost(normalized);
    const isPrivate = this.isPrivateIP(normalized);
    const usePublicLookup = isLocalhost || isPrivate;

    return {
      original: ip,
      normalized,
      isLocalhost,
      isPrivate,
      usePublicLookup,
      lookupIP: usePublicLookup ? '' : normalized,
    };
  }
}

module.exports = IPValidator;

// In geolocation.js - usage
const IPValidator = require('../utils/ip-validator');

const validation = IPValidator.validate(ip);
logger.debug('IP validation', validation);
const lookupIP = validation.lookupIP;
```

**Benefits:**
- DRY principle - single source of truth
- Easy to unit test independently
- Reusable across modules
- Better security audit trail
- Self-documenting code
- Could be npm package later

**Testing:**
```javascript
// tests/unit/utils/ip-validator.test.js
describe('IPValidator', () => {
  describe('normalizeIP', () => {
    it('should extract IPv4 from IPv6-mapped format');
    it('should return IPv4 unchanged');
    it('should handle null/undefined');
  });

  describe('isLocalhost', () => {
    it('should detect IPv4 localhost');
    it('should detect IPv6 localhost');
    it('should detect 127.x.x.x range');
  });

  describe('isPrivateIP', () => {
    it('should detect 10.x.x.x range');
    it('should detect 192.168.x.x range');
    it('should detect 172.16-31.x.x range');
  });

  describe('validate', () => {
    it('should return comprehensive validation result');
  });
});
```

---

#### 4. 🆕 Extract Test Helper Utilities
**Status:** New Opportunity
**Impact:** ⭐⭐⭐⭐ (Test Maintainability)
**Effort:** 2 hours

**Problem Identified:**
- Nock setup duplicated across 4 test files (49 occurrences)
- Mock API response patterns repeated
- Test data fixtures scattered
- No centralized test utilities

**Affected Files:**
```
tests/unit/services/geolocation.test.js     - 22 nock setups
tests/unit/services/health.test.js          - 11 nock setups
tests/integration/api/health.test.js        - 13 nock setups
tests/integration/security/security.test.js - 3 nock setups
```

**Current Pattern (repeated 49 times):**
```javascript
beforeEach(() => {
  nock.cleanAll();
});

// In each test:
nock('https://ipapi.co')
  .get('/8.8.8.8/json')
  .reply(200, {
    ip: '8.8.8.8',
    city: 'Mountain View',
    timezone: 'America/Los_Angeles',
    // ... repeated structure
  });
```

**Proposed Solution:**
```javascript
// Create tests/helpers/nock-mocks.js
const nock = require('nock');

/**
 * Mock fixtures for ipapi.co responses
 */
const MOCK_RESPONSES = {
  SUCCESS: {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 37.4056,
    longitude: -122.0775,
  },
  PRIVATE_IP: {
    ip: '192.168.1.1',
    city: 'Unknown',
    timezone: 'UTC',
  },
  // Add more fixtures...
};

/**
 * Set up nock mock for successful geolocation
 * @param {string} ip - IP to mock
 * @param {Object} response - Response data (default: MOCK_RESPONSES.SUCCESS)
 */
function mockGeolocationSuccess(ip = '8.8.8.8', response = MOCK_RESPONSES.SUCCESS) {
  return nock('https://ipapi.co')
    .get(`/${ip}/json`)
    .reply(200, response);
}

/**
 * Set up nock mock for API error
 * @param {string} ip - IP to mock
 * @param {number} statusCode - HTTP status code
 */
function mockGeolocationError(ip = '8.8.8.8', statusCode = 500) {
  return nock('https://ipapi.co')
    .get(`/${ip}/json`)
    .reply(statusCode, { error: 'API error' });
}

/**
 * Set up nock mock for timeout
 * @param {string} ip - IP to mock
 */
function mockGeolocationTimeout(ip = '8.8.8.8') {
  return nock('https://ipapi.co')
    .get(`/${ip}/json`)
    .delay(3000) // Longer than HEALTH_CHECK_TIMEOUT
    .reply(200, MOCK_RESPONSES.SUCCESS);
}

/**
 * Clean all nock mocks
 */
function cleanMocks() {
  nock.cleanAll();
}

module.exports = {
  MOCK_RESPONSES,
  mockGeolocationSuccess,
  mockGeolocationError,
  mockGeolocationTimeout,
  cleanMocks,
};

// Usage in tests:
const { mockGeolocationSuccess, cleanMocks } = require('../../helpers/nock-mocks');

beforeEach(() => {
  cleanMocks();
});

it('should fetch timezone data', async () => {
  mockGeolocationSuccess('8.8.8.8');
  // Test logic...
});
```

**Benefits:**
- Eliminate 49 duplicate nock setups
- Centralized test fixtures
- Easier to maintain mock responses
- Consistent test data across suites
- Faster test writing

**Impact:**
- Reduce test code by ~200 lines
- Improve test readability
- Make tests more maintainable

---

#### 5. 🆕 Add Centralized Error Handler Middleware
**Status:** New Opportunity
**Impact:** ⭐⭐⭐⭐ (Error Handling, Debugging)
**Effort:** 2 hours

**Current Issues:**
- Error handling duplicated in each route
- Inconsistent error response format
- No centralized error logging
- Stack traces may leak in production

**Current Pattern (repeated in app.js:104-107, 86-92):**
```javascript
catch (error) {
  logger.error('Timezone API error', { error: error.message, ip: req.ip });
  res.status(500).json({ error: 'Failed to fetch timezone information' });
}
```

**Proposed Solution:**
```javascript
// Create src/middleware/error-handler.js
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Centralized error handler middleware
 * Must be last in middleware stack
 */
function errorHandler(err, req, res, next) {
  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;

  // Log error with context
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    details: err.details,
  });

  // Send error response
  const response = {
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  };

  res.status(statusCode).json(response);
}

module.exports = { errorHandler, APIError };

// In app.js - simplified routes
app.get('/api/timezone', apiLimiter, async (req, res, next) => {
  try {
    const clientIP = req.ip;
    const timezoneInfo = await geolocationService.getTimezoneByIP(clientIP);
    res.json(timezoneInfo);
  } catch (error) {
    // Pass to error handler
    next(new APIError('Failed to fetch timezone information', 500, {
      ip: clientIP,
      originalError: error.message,
    }));
  }
});

// Add error handler (LAST middleware)
app.use(errorHandler);
```

**Benefits:**
- Consistent error responses
- Centralized error logging
- No stack trace leaks in production
- Better debugging with context
- Easier to add error monitoring (Sentry, etc.)

---

### 🟡 MEDIUM PRIORITY (Next Sprint)

#### 6. 🆕 Add Request/Response Logging Middleware
**Status:** New Opportunity
**Impact:** ⭐⭐⭐ (Observability)
**Effort:** 1 hour

**Proposed:**
```javascript
// Create src/middleware/request-logger.js
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
}

module.exports = requestLogger;
```

---

#### 7. Add Error Context to Error Messages
**Status:** Pending
**Impact:** ⭐⭐⭐ (Debugging)
**Effort:** 1 hour
**Previous ID:** #7

**Note:** Will be automatically addressed by implementing #5 (Centralized Error Handler)

---

#### 8. Centralize Configuration Management
**Status:** Pending
**Impact:** ⭐⭐⭐ (Maintainability)
**Effort:** 1.5 hours
**Previous ID:** #8

**Current Issues:**
- Environment variables accessed directly throughout code
- No validation of required config
- No type coercion

**Proposed:**
```javascript
// Create src/config/index.js
const CONSTANTS = require('./constants');

class Config {
  constructor() {
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.corsOrigin = process.env.CORS_ORIGIN || '*';
    this.logLevel = process.env.LOG_LEVEL || 'info';

    this.validate();
  }

  validate() {
    if (isNaN(this.port) || this.port < 1 || this.port > 65535) {
      throw new Error('Invalid PORT configuration');
    }

    if (this.isProduction && this.corsOrigin === '*') {
      console.warn('WARNING: CORS origin set to * in production');
    }
  }

  get isProduction() {
    return this.nodeEnv === 'production';
  }

  get isDevelopment() {
    return this.nodeEnv === 'development';
  }
}

module.exports = new Config();
```

---

#### 9-15. Additional Medium Priority Items

9. Remove Promise.resolve() wrapper (health.js:95) - 5 min
10. Extract date formatter configuration - 30 min
11. Add request ID middleware - 1 hour
12. Reduce cache logging verbosity - 30 min
13. Add input validation middleware - 2 hours
14. Extract response formatting utilities - 1 hour
15. Add API documentation (Swagger) - 3 hours

---

### 🟢 LOW PRIORITY (Backlog)

16. Add .env.example file - 15 min
17. Add dependency injection pattern - 4 hours
18. Add request validation schemas (Joi/Zod) - 2 hours
19. Add API versioning (/api/v1/) - 1 hour
20. Add caching headers (ETag) - 1 hour
21. Add security headers audit - 1 hour
22. Add performance monitoring - 3 hours
23. Add load testing suite - 3 hours
24. 🆕 Create shared test fixtures - 1 hour
25. 🆕 Add test helper directory structure - 30 min
26. 🆕 Extract timezone formatting utilities - 1 hour
27. 🆕 Add API response wrapper utilities - 1 hour
28. 🆕 Improve test organization - 2 hours

---

## Updated Implementation Roadmap

### Sprint 1 (Current): Critical Production Readiness
**Focus:** Graceful shutdown + Controller extraction
**Duration:** 1 week
**Effort:** 5 hours

- [ ] Add graceful shutdown handler (#1) - **2 hours** ⚠️ MILESTONE 9
- [ ] Extract route handlers to controllers (#2) - **3 hours**

**Deliverables:**
- Production-ready shutdown handling
- Clean MVC architecture
- Controller unit tests
- Milestone 9 complete

---

### Sprint 2: Code Quality & Organization
**Focus:** IP validation + Test utilities + Error handling
**Duration:** 1 week
**Effort:** 6 hours

- [ ] Consolidate IP validation logic (#3) - **2 hours**
- [ ] Extract test helper utilities (#4) - **2 hours**
- [ ] Add centralized error handler (#5) - **2 hours**

**Deliverables:**
- Reusable IP validator utility
- Reduced test code duplication (~200 lines saved)
- Consistent error handling
- Better test maintainability

---

### Sprint 3: Observability & Configuration
**Focus:** Logging + Config management
**Duration:** 1 week
**Effort:** 4 hours

- [ ] Add request/response logging (#6) - **1 hour**
- [ ] Centralize configuration management (#8) - **1.5 hours**
- [ ] Add error context improvements (#7) - **1 hour**
- [ ] Add request ID middleware (#11) - **30 min**

**Deliverables:**
- Complete request tracing
- Centralized config with validation
- Better debugging capabilities
- Production observability

---

### Sprint 4: Quick Wins & Enhancements
**Focus:** Small improvements
**Duration:** 1 week
**Effort:** 3 hours

- [ ] Remove Promise.resolve() wrapper (#9) - **5 min**
- [ ] Extract date formatter (#10) - **30 min**
- [ ] Reduce cache logging verbosity (#12) - **30 min**
- [ ] Add input validation middleware (#13) - **2 hours**

---

### Sprint 5: Advanced Features (Backlog)
**Focus:** Documentation & Monitoring
**Duration:** 2 weeks
**Effort:** 6-8 hours

- [ ] Add API documentation (Swagger) (#15) - **3 hours**
- [ ] Add .env.example (#16) - **15 min**
- [ ] Add performance monitoring (#22) - **3 hours**
- [ ] Add load testing suite (#23) - **3 hours**

---

## Status Summary

### Completed ✅ (3 opportunities)
1. Winston Logger Implementation (#1) - Milestone 6
2. Extract Magic Numbers to Constants (#2)
3. Add Compression Middleware (#13)

### Next Sprint ⏳ (Critical - 2 opportunities)
1. Add Graceful Shutdown (#5) - Milestone 9 - **MUST DO NEXT**
2. Extract Route Handlers to Controllers (#6)

### High Priority 🔴 (3 opportunities)
3. Consolidate IP Validation (#3)
4. Extract Test Helper Utilities (#4) 🆕
5. Add Centralized Error Handler (#5) 🆕

### Medium Priority 🟡 (10 opportunities)
Including request logging, config management, validation

### Low Priority 🟢 (13 opportunities)
Including documentation, monitoring, testing enhancements

---

## Test Coverage Impact

**Current:** 96.06% (167 tests passing)

**After Sprint 1:**
- Controllers: +15 unit tests
- Graceful shutdown: +5 tests
- **Expected:** 187 tests, 97% coverage

**After Sprint 2:**
- IP validator: +10 unit tests
- Test utilities: Reduces test code by 200 lines
- Error handler: +8 tests
- **Expected:** 205 tests, 98% coverage

---

## Risk Assessment

| Refactoring | Risk | Mitigation |
|------------|------|------------|
| Graceful shutdown | Low | Add timeout safety, test with Docker |
| Controller extraction | Low | 100% test coverage exists |
| IP validation extraction | Low | Comprehensive unit tests |
| Test helper utilities | Very Low | Doesn't change logic |
| Error handler | Medium | Ensure all errors are caught |
| Config centralization | Low | Validation on startup |

---

## Quality Gates

All refactoring must maintain:
- ✅ 96%+ test coverage
- ✅ All tests passing
- ✅ 0 ESLint errors
- ✅ Pre-commit/pre-push hooks passing
- ✅ No performance degradation
- ✅ Backward compatibility

---

## Total Effort Estimation (Updated)

- **Completed:** 3 items → ~8 hours ✅
- **Sprint 1 (Critical):** 2 items → 5 hours ⏳
- **Sprint 2 (High):** 3 items → 6 hours
- **Sprint 3 (Medium):** 4 items → 4 hours
- **Sprint 4 (Quick Wins):** 4 items → 3 hours
- **Remaining:** 17 items → 20-30 hours

**Total Original:** 28 opportunities → 33-47 hours
**Completed:** 3 opportunities → ~8 hours
**Remaining:** 25 opportunities (+ 8 new) → 38-45 hours

---

## Next Actions

### Immediate (This Week)
1. **Start Milestone 9** - Implement graceful shutdown (#1)
   - This is already planned and documented
   - Required for production deployment
   - Blocks Milestone 9 completion

2. **Extract Controllers** (#2)
   - Improves testability
   - Clean MVC architecture
   - Prepares for future growth

### Soon (Next Week)
3. **IP Validator Utility** (#3)
4. **Test Helper Utilities** (#4)
5. **Error Handler Middleware** (#5)

---

## Notes

- Winston Logger (Milestone 6) completed successfully on 2026-01-25
- Constants extraction completed with excellent documentation
- Compression middleware added with full test coverage
- Test code has significant duplication opportunity (49 nock setups)
- No breaking changes in completed work
- All refactoring follows conventional commits
- Pre-push hooks validate all changes

**Recommendation:** Focus on Sprint 1 (Graceful Shutdown + Controllers) to complete Milestone 9 and improve code organization before adding more features.
