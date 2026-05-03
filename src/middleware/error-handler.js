const config = require('../config');
const logger = require('../utils/logger');

class APIError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  logger.error('Request error', {
    error: err.message,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    ...(err.details && Object.keys(err.details).length > 0 && { details: err.details }),
  });

  if (err.details?.retryAfter) {
    res.setHeader('Retry-After', String(err.details.retryAfter));
  }

  const response = {
    error: err.message || 'Internal server error',
    ...(config.isDevelopment && { stack: err.stack, details: err.details }),
  };

  res.status(statusCode).json(response);
}

module.exports = { APIError, errorHandler };
