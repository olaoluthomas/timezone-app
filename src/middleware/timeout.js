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
