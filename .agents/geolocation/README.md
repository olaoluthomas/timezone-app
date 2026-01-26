# Geolocation Domain Patterns

Domain-specific patterns for IP geolocation and timezone detection.

## Caching Strategy

### Configuration

```javascript
const CACHE_CONFIG = {
  ttl: 86400, // 24 hours
  maxKeys: 10000, // 10,000 entries
  checkperiod: 600, // Clean up every 10 minutes
};
```

### Why These Values?

**24-hour TTL**:
- User location rarely changes within a day
- Reduces API calls by 80-90%
- Balances freshness vs performance

**10,000 entries**:
- ~640 KB memory (64 bytes per entry)
- Handles 10k unique IPs per day
- Free tier: 30k requests/month → 3k/day without cache

**Performance**:
- Cached: <10ms response
- Uncached: 200-500ms (external API)
- Hit rate: 80-90% in production

### Cache Key Pattern

```javascript
function getCacheKey(ip) {
  // Normalize IP address
  const normalized = normalizeIP(ip);

  // Use IP as cache key
  return `geo:${normalized}`;
}
```

### Cache Flow

```javascript
async function getTimezone(ip) {
  // 1. Check cache
  const cacheKey = getCacheKey(ip);
  const cached = cache.get(cacheKey);

  if (cached) {
    logger.info('Cache hit', { ip, key: cacheKey });
    return cached;
  }

  // 2. Cache miss - fetch from API
  logger.info('Cache miss', { ip, key: cacheKey });
  const data = await fetchFromAPI(ip);

  // 3. Store in cache
  cache.set(cacheKey, data);

  return data;
}
```

## IP Normalization

### IPv4 and IPv6 Handling

```javascript
function normalizeIP(ip) {
  if (!ip) return null;

  // Remove port if present
  ip = ip.split(':').slice(0, -1).join(':') || ip;

  // Handle IPv6-mapped IPv4 (::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  // Handle localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    // Use a default IP for development
    return null; // Will trigger default behavior
  }

  return ip;
}
```

### X-Forwarded-For Header

```javascript
function getClientIP(req) {
  // 1. Check X-Forwarded-For (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Take first IP (client IP)
    return forwarded.split(',')[0].trim();
  }

  // 2. Check X-Real-IP
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }

  // 3. Fall back to req.ip
  return req.ip;
}
```

## External API Integration

### ipapi.co Integration

**Free Tier Limits**:
- 30,000 requests/month (~1,000/day)
- No API key required
- Rate limit: 1,000/day per IP

**Endpoint**:
```
GET https://ipapi.co/{ip}/json
```

**Response**:
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "timezone": "America/Los_Angeles",
  "latitude": 37.4056,
  "longitude": -122.0775
}
```

### API Client Pattern

```javascript
const fetch = require('node-fetch');

async function fetchFromAPI(ip) {
  const url = `https://ipapi.co/${ip}/json`;

  try {
    const response = await fetch(url, {
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'timezone-app/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Validate required fields
    if (!data.timezone) {
      throw new Error('Missing timezone in response');
    }

    return data;
  } catch (error) {
    logger.error('API fetch failed', {
      ip,
      error: error.message,
    });
    throw error;
  }
}
```

### Error Handling

```javascript
async function getTimezoneWithFallback(ip) {
  try {
    return await getTimezone(ip);
  } catch (error) {
    // 1. Log error
    logger.error('Timezone lookup failed', {
      ip,
      error: error.message,
    });

    // 2. Return fallback response
    return {
      error: 'Unable to determine timezone',
      ip: ip,
      timezone: 'UTC', // Safe fallback
    };
  }
}
```

### Rate Limiting Consideration

```javascript
// Track API calls to avoid hitting rate limit
let apiCallCount = 0;
const resetTime = Date.now() + 24 * 60 * 60 * 1000;

async function fetchFromAPI(ip) {
  // Check if approaching rate limit
  if (apiCallCount >= 900) { // 90% of 1000 daily limit
    logger.warn('Approaching API rate limit', {
      count: apiCallCount,
      resetTime: new Date(resetTime),
    });

    // Could implement queue or reject new requests
  }

  apiCallCount++;

  // Make API call...
}
```

## Testing Patterns

### Mocking External API

```javascript
const nock = require('nock');

describe('Geolocation Service', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should fetch timezone from API', async () => {
    nock('https://ipapi.co')
      .get('/8.8.8.8/json')
      .reply(200, {
        ip: '8.8.8.8',
        timezone: 'America/Los_Angeles',
        city: 'Mountain View',
        country: 'US',
      });

    const result = await getTimezone('8.8.8.8');

    expect(result.timezone).toBe('America/Los_Angeles');
  });

  it('should handle API errors', async () => {
    nock('https://ipapi.co')
      .get('/8.8.8.8/json')
      .reply(500);

    await expect(getTimezone('8.8.8.8')).rejects.toThrow();
  });
});
```

### Testing Cache Behavior

```javascript
describe('Cache Integration', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheService();
  });

  afterEach(() => {
    cache.flushAll();
  });

  it('should cache successful responses', async () => {
    // Mock API
    nock('https://ipapi.co')
      .get('/8.8.8.8/json')
      .once()
      .reply(200, { timezone: 'America/Los_Angeles' });

    // First call - cache miss
    const result1 = await getTimezone('8.8.8.8');

    // Second call - cache hit (API shouldn't be called again)
    const result2 = await getTimezone('8.8.8.8');

    expect(result1).toEqual(result2);
    expect(nock.isDone()).toBe(true); // Verify API called only once
  });
});
```

## Performance Optimization

### Cache Hit Rate Monitoring

```javascript
let cacheHits = 0;
let cacheMisses = 0;

function getCacheStats() {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;

  return {
    hits: cacheHits,
    misses: cacheMisses,
    total,
    hitRate: hitRate.toFixed(2) + '%',
  };
}

// Add to health check
router.get('/health/ready', (req, res) => {
  res.json({
    status: 'ready',
    cache: getCacheStats(),
  });
});
```

### Response Time Tracking

```javascript
async function getTimezoneWithMetrics(ip) {
  const startTime = Date.now();

  try {
    const result = await getTimezone(ip);
    const duration = Date.now() - startTime;

    logger.info('Timezone lookup', {
      ip,
      duration,
      cached: duration < 50, // < 50ms likely cached
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Timezone lookup failed', {
      ip,
      duration,
      error: error.message,
    });
    throw error;
  }
}
```

## Alternative Providers

### ipapi.co (Current)
- ✅ Free tier: 30k requests/month
- ✅ No API key required
- ✅ Good accuracy
- ❌ Rate limits

### ip-api.com
- ✅ Free tier: 45 requests/minute
- ✅ No API key for non-commercial
- ❌ Requires commercial license for business

### ipgeolocation.io
- ✅ Free tier: 1k requests/day
- ✅ Good accuracy
- ❌ Requires API key

### MaxMind GeoIP2
- ✅ Most accurate
- ✅ Local database (no API calls)
- ❌ Paid service
- ❌ Requires database updates

## Migration Strategy

If switching providers:

1. **Implement adapter pattern**
   ```javascript
   class GeolocationAdapter {
     async getTimezone(ip) {
       // Abstract interface
     }
   }

   class IPApiAdapter extends GeolocationAdapter {
     // ipapi.co implementation
   }

   class IPGeolocationAdapter extends GeolocationAdapter {
     // ipgeolocation.io implementation
   }
   ```

2. **Test both providers in parallel**
3. **Gradual rollout** with feature flag
4. **Monitor accuracy and performance**
5. **Switch when confident**

## See Also

- [ipapi.co Documentation](https://ipapi.co/api/)
- [IANA Timezone Database](https://www.iana.org/time-zones)
- Project `src/services/geolocation.js` - Implementation
