const healthService = require('../services/health');

async function getLiveness(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

async function getReadiness(req, res, next) {
  try {
    const healthStatus = await healthService.performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    next(error);
  }
}

module.exports = { getLiveness, getReadiness };
