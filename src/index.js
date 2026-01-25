/**
 * Server Entry Point
 *
 * Starts the Express application and listens on the configured port.
 * This is the main entry point for the application in production and development.
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 *
 * @module index
 */

const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
});
