/**
 * Request Timeout Middleware
 *
 * Implements request and response timeouts to prevent resource exhaustion
 * from slow clients or long-running operations.
 *
 * Default Timeout: 30 seconds
 * - Sufficient for external API calls (200-500ms typical)
 * - Protects against hanging requests
 * - Prevents server resource exhaustion
 *
 * Usage:
 *   app.use(timeoutMiddleware(30000))
 *
 * @module middleware/timeout
 */

/**
 * Request and response timeout middleware
 * Protects against slow clients and long-running requests
 *
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns {function} Express middleware function
 */
function timeoutMiddleware(timeoutMs = 30000) {
  return (req, res, next) => {
    req.setTimeout(timeoutMs);
    res.setTimeout(timeoutMs);
    next();
  };
}

module.exports = timeoutMiddleware;
