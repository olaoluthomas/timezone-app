# Troubleshooting Guide

This document provides solutions for common issues encountered when using the timezone application.

## Common Issues and Solutions

### Tests Failing

**Symptoms**: Test suite fails with errors or coverage issues

**Solutions**:
- Clear cache and reinstall dependencies:
  ```bash
  rm -rf node_modules coverage
  npm install
  npm test
  ```
- Check for syntax errors in test files
- Verify that all required dependencies are installed
- Ensure that test environment variables are correctly configured

### Port Already in Use

**Symptoms**: Cannot start application due to port conflict

**Solutions**:
- Set a different port:
  ```bash
  PORT=3001 npm start
  ```
- Stop the conflicting process:
  ```bash
  lsof -i :3000 | grep LISTEN
  kill <process-id>
  ```
- Use a different port in Docker:
  ```bash
docker run -d -p 3001:3000 --name timezone-app timezone-app
  ```

### Cache Not Working

**Symptoms**: Cache is not being used or cache stats are missing

**Solutions**:
- Verify node-cache is installed: `npm list node-cache`
- Check console logs for "Cache HIT" and "Cache MISS" messages
- Verify cache configuration in `src/services/cache.js`
- Ensure cache is properly initialized in the application startup
- Check that the cache TTL is set correctly

### Health Check Failing

**Symptoms**: `GET /health` or `GET /health/ready` returns errors or fails

**Solutions**:
- Test health endpoints directly:
  ```bash
  curl http://localhost:3000/health
  curl http://localhost:3000/health/ready
  ```
- Check if external API is accessible:
  ```bash
  curl https://ipapi.co/json/
  ```
- Verify that the geolocation API is available and responding
- Check if the cache service is operational
- Ensure that the application is properly loaded before health checks

### Linting Errors

**Symptoms**: ESLint reports issues with code formatting or style

**Solutions**:
- Auto-fix most linting issues:
  ```bash
  npm run lint:fix
  ```
- Format code:
  ```bash
  npm run format
  ```
- Review the specific linting rules in `.eslintrc.js`
- Adjust configuration settings to match team standards

## Debug Mode

Enable detailed logging to help diagnose issues:

```bash
NODE_ENV=development npm start
```

This will show more detailed logs including:
- Request processing times
- Cache hit/miss statistics
- Error stack traces
- Internal application state

## Getting Help

If you're unable to resolve an issue, follow these steps:

1. **Check existing issues** on the GitHub repository
2. **Review test files** for usage examples and error messages
3. **Consult the API documentation** above
4. **Open a new issue** with reproduction steps including:
   - Exact steps to reproduce
   - Error messages and stack traces
   - Environment details (Node.js version, OS)
   - Configuration files (if applicable)

## Performance Monitoring

The application provides performance metrics that can help identify issues:

- **Cache hit rate**: Monitored in health checks
- **Response times**: Measured for both cached and uncached requests
- **API call reduction**: Tracks the percentage of requests served from cache

## Error Codes and Messages

The application returns standard HTTP status codes:
- `200`: Success
- `503`: Service unavailable (external API or cache issues)

For detailed error messages, check the health check response under the `checks` object for readiness endpoints.

## Support

For issues, questions, or suggestions:
- Open an issue on the GitHub repository
- Include error messages and logs
- Provide Node.js version: `node --version`
- Include test output if applicable

## Performance Tips

1. **Increase Cache TTL** for more stable locations:
   ```javascript
   // In src/services/cache.js
   stdTTL: 86400 * 7  // 7 days instead of 24 hours
   ```

2. **Adjust Cache Size** for high-traffic applications:
   ```javascript
   // In src/services/cache.js
   maxKeys: 50000  // Increase from 10,000
   ```

3. **Monitor Cache Hit Rate**:
   ```javascript
   const stats = cache.getStats();
   console.log(`Cache hit rate: ${stats.hitRate}%`);
   ```

This guide should help resolve most common issues encountered when using the timezone application. If you continue to experience problems, please open a new issue with detailed reproduction steps.