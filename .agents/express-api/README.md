# Express API Patterns

Express.js patterns and practices used in the timezone project.

## Middleware Organization

### Middleware Order (Matters!)

```javascript
// 1. Logging (first to catch all requests)
app.use(requestLogger);

// 2. Security headers
app.use(helmet());

// 3. CORS
app.use(corsMiddleware);

// 4. Body parsing
app.use(express.json());

// 5. Request timeout
app.use(timeoutMiddleware);

// 6. Rate limiting (after body parsing)
app.use(rateLimitMiddleware);

// 7. Routes
app.use('/api', apiRoutes);

// 8. Static files (if any)
app.use(express.static('public'));

// 9. 404 handler (after all routes)
app.use(notFoundHandler);

// 10. Error handler (LAST)
app.use(errorHandler);
```

### Why This Order?

1. **Logging first**: Capture all requests, even those that fail
2. **Security early**: Apply security headers before processing
3. **CORS before routes**: Validate origin before handling request
4. **Rate limit after parsing**: Need body for some rate limit strategies
5. **Routes in middle**: Main application logic
6. **404 after routes**: Only hit if no route matched
7. **Error handler last**: Catch all errors from above

## Route Handler Pattern

### Structure

```javascript
// routes/api.js
const express = require('express');
const router = express.Router();
const { getTimezone } = require('../services/geolocation');
const logger = require('../utils/logger');

router.get('/timezone', async (req, res, next) => {
  try {
    // 1. Extract parameters
    const ip = req.ip || req.headers['x-forwarded-for'];

    // 2. Validate inputs (if needed)
    if (!ip) {
      return res.status(400).json({
        error: 'IP address required',
      });
    }

    // 3. Call service layer
    const data = await getTimezone(ip);

    // 4. Transform response (if needed)
    const response = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // 5. Send response
    res.json(response);
  } catch (error) {
    // 6. Pass errors to error handler
    next(error);
  }
});

module.exports = router;
```

### Best Practices

1. **Use async/await**: Cleaner than callbacks/promises
2. **Validate early**: Return errors before processing
3. **Use services**: Keep routes thin, logic in services
4. **Pass to next()**: Let error middleware handle errors
5. **Log important events**: Use structured logging

## Error Handling

### Error Handler Middleware

```javascript
// middleware/error-handler.js
function errorHandler(err, req, res, next) {
  // 1. Log the error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // 2. Determine status code
  const statusCode = err.statusCode || 500;

  // 3. Send appropriate response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}

module.exports = errorHandler;
```

### Custom Error Classes

```javascript
// utils/errors.js
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

module.exports = { ApiError, NotFoundError, ValidationError };
```

### Usage

```javascript
const { NotFoundError } = require('../utils/errors');

router.get('/user/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});
```

## Health Checks

### Liveness Probe

**Purpose**: Is the app running?

```javascript
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});
```

### Readiness Probe

**Purpose**: Is the app ready to serve traffic?

```javascript
router.get('/health/ready', async (req, res) => {
  const checks = {
    cache: checkCache(),
    externalApi: await checkExternalApi(),
  };

  const allHealthy = Object.values(checks).every((c) => c.healthy);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

function checkCache() {
  try {
    cache.get('test-key');
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

async function checkExternalApi() {
  try {
    // Quick API check (with timeout)
    const response = await fetch('https://ipapi.co/json', {
      timeout: 2000,
    });
    return { healthy: response.ok };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}
```

## Testing Patterns

### Route Testing

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/timezone', () => {
  it('should return 200 and timezone data', async () => {
    const response = await request(app)
      .get('/api/timezone')
      .set('X-Forwarded-For', '8.8.8.8')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('timezone');
    expect(response.body).toHaveProperty('ip');
  });

  it('should handle errors gracefully', async () => {
    const response = await request(app)
      .get('/api/timezone')
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});
```

## See Also

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Error Handling in Express](https://expressjs.com/en/guide/error-handling.html)
- Project `src/app.js` - Live example
