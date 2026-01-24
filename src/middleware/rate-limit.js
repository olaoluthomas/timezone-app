const rateLimit = require('express-rate-limit');

/**
 * API rate limiter - Strict limits for main API endpoints
 * Protects the free tier API quota (30k requests/month)
 * With 80-90% cache hit rate, can serve 150k-300k requests/month
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Automatically handles X-Forwarded-For and IPv6
  // Default keyGenerator is IP-based and handles proxies correctly
});

/**
 * Health check rate limiter - More lenient for monitoring tools
 * Allows Kubernetes, Docker, and monitoring systems to check frequently
 */
const healthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Higher limit for health checks
  message: {
    error: 'Health check rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Automatically handles X-Forwarded-For and IPv6
});

module.exports = { apiLimiter, healthLimiter };
