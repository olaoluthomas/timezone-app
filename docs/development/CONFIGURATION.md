# Configuration Guide

This document provides detailed information about advanced configuration options for the timezone application.

## Environment Variables

The application uses the following environment variables:

| Variable | Default | Description |
|---------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | production | Environment mode (`development` or `production`) |
| `LOG_LEVEL` | info | Logging verbosity (`debug`, `info`, `warn`, `error`) |
| `ALLOWED_ORIGINS` | (empty) | CORS whitelist (comma-separated, production only) |
| `CACHE_TTL` | 86400 | Cache time-to-live in seconds (24 hours = 86400) |
| `MAX_CACHE_KEYS` | 10000 | Maximum number of cached entries |
| `RATE_LIMIT_API` | 100 | API rate limit (requests per 15 minutes) |
| `RATE_LIMIT_HEALTH` | 300 | Health endpoint rate limit (requests per 15 minutes) |
| `TIMEOUT` | 30000 | Request timeout in milliseconds |
| `MAX_PAYLOAD_SIZE` | 1024 | Maximum request payload size in bytes |

## Logging Configuration

The application supports different logging levels:

- `debug`: All log messages including detailed internal operations
- `info`: Informational messages about application events
- `warn`: Warning messages about potential issues
- `error`: Error messages about failures

**Log levels are set via the `LOG_LEVEL` environment variable.**

## CORS Configuration

CORS (Cross-Origin Resource Sharing) is configured based on the environment:

- **Development**: All origins are allowed
- **Production**: Only origins specified in `ALLOWED_ORIGINS` are allowed

**Example production configuration:**
```env
ALLOWED_ORIGINS=https://app.timezone.com,https://dashboard.timezone.com
```

## Rate Limiting Configuration

The application implements rate limiting to prevent abuse:

- **API Endpoint**: 100 requests per 15 minutes
- **Health Endpoint**: 300 requests per 15 minutes

Rate limiting is enforced at the request level and includes:
- Request counting per IP address
- Time-based windowing (15-minute window)
- Immediate rejection of requests exceeding the limit

## Cache Configuration

The application uses an in-memory LRU (Least Recently Used) cache with the following settings:

- **TTL (Time-to-Live)**: Default is 24 hours (86400 seconds), can be adjusted via `CACHE_TTL`
- **Maximum Size**: Default is 10,000 entries, can be adjusted via `MAX_CACHE_KEYS`
- **Cache Hit Rate**: Monitored and reported in the health check

**Cache hit rate calculation:**
```javascript
const hitRate = (hits / (hits + misses)) * 100;
```

## Security Headers Configuration

The application includes security headers for enhanced protection:

- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `X-XSS-Protection`: `1; mode=block`
- `Strict-Transport-Security`: `max-age=31536000`
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:`

## Advanced Configuration Examples

### Increasing Cache TTL
```javascript
// In src/services/cache.js
stdTTL: 86400 * 7  // 7 days instead of 24 hours
```

### Increasing Cache Size
```javascript
// In src/services/cache.js
maxKeys: 50000  // Increase from 10,000
```

### Adjusting Rate Limits
```javascript
// In src/middleware/rate-limit.js
apiRateLimit: 200,  // 200 requests per 15 minutes
healthRateLimit: 500 // 500 requests per 15 minutes
```

## Configuration File Structure

The configuration is loaded from environment variables, with fallbacks for missing variables.

### Environment Variable File (.env)
```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
ALLOWED_ORIGINS=https://app.timezone.com,https://dashboard.timezone.com
CACHE_TTL=86400
MAX_CACHE_KEYS=10000
RATE_LIMIT_API=100
RATE_LIMIT_HEALTH=300
TIMEOUT=30000
MAX_PAYLOAD_SIZE=1024
```

## Troubleshooting Configuration Issues

- **Cache not working**: Check if node-cache is installed: `npm list node-cache`
- **Rate limiting errors**: Verify rate limit values are not exceeded
- **CORS errors**: Ensure allowed origins are correctly configured
- **Log level issues**: Verify LOG_LEVEL is set correctly
- **Missing environment variables**: Ensure all required variables are present in .env file