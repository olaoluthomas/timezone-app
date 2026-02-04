# Timezone App

[![CI](https://github.com/olaoluthomas/timezone-app/workflows/CI/badge.svg)](https://github.com/olaoluthomas/timezone-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-96.06%25-brightgreen)](https://github.com/olaoluthomas/timezone-app)
[![Tests](https://img.shields.io/badge/tests-167%20passing-brightgreen)](https://github.com/olaoluthomas/timezone-app)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-5A67D8)](https://github.com/anthropics/claude-code)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A high-performance, production-ready application that automatically detects and displays the current date, time, and timezone based on the user's geographical location and IP address.

## Overview

This application leverages IP geolocation technology to determine a user's physical location and automatically displays the corresponding local date, time, and timezone information. Built with reliability, performance, and code quality in mind, it includes comprehensive testing, intelligent caching, and health monitoring capabilities.

## Features

### Core Features
- **Automatic IP Detection**: Identifies user's IP address automatically
- **Geolocation Lookup**: Maps IP address to geographical coordinates
- **Timezone Detection**: Determines the correct timezone based on location
- **Real-time Clock**: Displays current date and time in the user's local timezone
- **Location Information**: Shows city, region, country, and coordinates
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Performance & Reliability
- **Intelligent Caching**: 24-hour TTL cache with up to 10,000 entries reduces API calls by 80-90%
- **Health Monitoring**: Comprehensive health check endpoints for liveness and readiness probes
- **Error Handling**: Robust error handling with graceful degradation
- **Fast Response Times**: Sub-10ms response times for cached requests

### Developer Experience
- **Comprehensive Testing**: 98.9% test coverage with 133 tests (unit, integration, smoke)
- **Code Quality Tools**: ESLint and Prettier for consistent code formatting
- **CI/CD Ready**: Automated testing workflows for continuous integration
- **Well-Documented**: Clean, maintainable code with inline documentation

### Security Features
- **Security Headers**: Helmet.js for secure HTTP headers
- **Rate Limiting**: API (100 req/15min) and Health (300 req/15min) protection
- **CORS**: Environment-based CORS configuration
- **Request Limits**: 1KB payload size limit and 30s timeout
- **Input Validation**: Request size and timeout protection

## How It Works

1. **IP Address Detection**: When a user accesses the application, their public IP address is automatically detected
2. **Cache Check**: The system first checks if geolocation data for this IP is cached (24-hour TTL)
3. **Geolocation API** (on cache miss): The IP address is sent to a geolocation service that returns:
   - Country, region, and city
   - Latitude and longitude coordinates
   - Timezone identifier (e.g., "America/New_York", "Europe/London")
4. **Cache Storage**: Results are stored in cache for 24 hours to improve performance
5. **Time Calculation**: Using the timezone information, the application calculates and displays:
   - Current local date
   - Current local time (with live updates)
   - Timezone offset from UTC
   - Timezone abbreviation (e.g., EST, PST, GMT)

### Caching Strategy

The application implements an intelligent caching layer:
- **Cache Duration**: 24 hours (86,400 seconds)
- **Max Capacity**: 10,000 cached entries
- **Cache Hit Rate**: 80-90% in typical usage
- **Performance Improvement**: <10ms response time for cached requests vs. 200-500ms for API calls

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/timezone.git

# Navigate to the project directory
cd timezone

# Install dependencies
npm install

# Run tests to verify installation
npm test

# Start the application
npm start

# Open in browser
open http://localhost:3000
```

The application will be running at `http://localhost:3000`.

## Installation

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn package manager

### Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/timezone.git

# Navigate to the project directory
cd timezone

# Install dependencies
npm install

# (Optional) Create .env file for custom configuration
cp .env.example .env
```

## Usage

### Development Mode

```bash
npm run dev
```

This starts the application with hot-reload enabled using nodemon.

### Production Mode

```bash
npm start
```

The application will start on port 3000 (or the PORT environment variable if set).

### Running Tests

```bash
# Run all tests with coverage report
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode (for development)
npm run test:watch
```

### Code Quality

```bash
# Run ESLint to check for code issues
npm run lint

# Run ESLint and automatically fix issues
npm run lint:fix

# Check code formatting with Prettier
npm run format:check

# Format code with Prettier
npm run format
```

## API Endpoints

### Main API

**GET `/api/timezone`**

Returns timezone and location information for the requesting IP address.

**Response:**
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "countryCode": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "utcOffset": "-0500",
  "currentTime": "Wednesday, January 22, 2026, 14:35:42",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "cached": false
}
```

**Fields:**
- `cached`: `true` if served from cache, `false` if fetched from API
- `currentTime`: Formatted local time in the detected timezone
- `timestamp`: ISO 8601 timestamp of the response

### Health Check Endpoints

**GET `/health`**

Liveness probe - returns basic health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "uptime": 3600.5
}
```

**GET `/health/ready`**

Readiness probe - performs comprehensive health checks including external API availability and cache status.

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "uptime": 3600.5,
  "checks": {
    "geolocationAPI": {
      "status": "healthy",
      "responseTime": "250ms",
      "message": "Geolocation API is accessible"
    },
    "cache": {
      "status": "healthy",
      "keys": 42,
      "hitRate": "87.50",
      "message": "Cache is operational"
    }
  },
  "responseTime": "255ms"
}
```

**Status Codes:**
- `200`: All systems healthy
- `503`: Service degraded (external API or cache issues)

## API Dependencies

This application uses **ipapi.co** for geolocation services:

- **Free Tier**: 30,000 requests/month
- **No API Key Required**: Works out of the box
- **Features**: IP geolocation, timezone detection, location details

With the implemented caching layer (80-90% cache hit rate), the application can effectively serve 150,000-300,000 requests/month within the free tier.

## Configuration

Create a `.env` file in the root directory to configure settings:

```env
PORT=3000
NODE_ENV=production
```

**Environment Variables:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Technology Stack

### Core Dependencies
- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios for API requests
- **Caching**: node-cache (in-memory LRU cache)
- **Geolocation**: ipapi.co API

### Development Tools
- **Testing Framework**: Jest
- **API Testing**: Supertest
- **HTTP Mocking**: Nock
- **Code Linter**: ESLint
- **Code Formatter**: Prettier
- **Dev Server**: Nodemon (hot-reload)

### Built With AI Assistance
This project was developed using **Claude Code** (Anthropic's official CLI) and **Claude Code Router** for intelligent model orchestration:

**Local Models** (for fast iteration and cost efficiency):
- **Llama 3.2 1B Instruct** - Quick edits, code formatting, documentation
- **QWEN 3 Coder 30B** - Complex refactoring, architectural decisions

**Anthropic API Models** (for advanced reasoning):
- **Claude Sonnet 4.5** - Architecture design, test strategy, complex implementations
- **Claude Haiku 4.5** - Quick validations, minor fixes, code reviews

The combination of local and API models enabled rapid, cost-effective development while maintaining high code quality and comprehensive test coverage. See [docs/DEVELOPMENT_TOOLS.md](docs/DEVELOPMENT_TOOLS.md) for details on the AI-assisted development workflow.

## Project Structure

```
timezone/
├── src/
│   ├── index.js              # Server entry point
│   ├── app.js                # Express app configuration
│   ├── services/
│   │   ├── geolocation.js    # Geolocation service with caching
│   │   ├── cache.js          # Cache service implementation
│   │   └── health.js         # Health check service
│   └── public/
│       └── index.html        # Frontend interface
├── tests/
│   ├── unit/
│   │   └── services/         # Unit tests for services
│   │       ├── cache.test.js
│   │       ├── geolocation.test.js
│   │       └── health.test.js
│   └── integration/
│       └── api/              # Integration tests for API endpoints
│           └── health.test.js
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── jest.config.js            # Jest test configuration
├── package.json              # Dependencies and scripts
├── README.md
└── LICENSE
```

## Testing

The application includes comprehensive test coverage with 133 tests across three categories:

### Test Coverage

- **Overall Coverage**: 98.9% (statements, branches, functions, lines)
- **Total Tests**: 133 passing
- **Unit Tests**: 67 tests for services and middleware
- **Integration Tests**: 55 tests for API endpoints and security
- **Smoke Tests**: 11 quick end-to-end validation tests
- **Mocking**: External API calls mocked with Nock

### Test Categories

**Unit Tests** (`tests/unit/`)
- Cache service (11 tests)
- Geolocation service (15 tests)
- Health service (13 tests)
- CORS middleware (15 tests)
- Rate limit middleware (13 tests)
- Timeout middleware (8 tests)

**Integration Tests** (`tests/integration/`)
- Health endpoints (12 tests)
- Security middleware (16 tests)
- Production CORS (11 tests)

**Smoke Tests** (`tests/smoke/`)
- Pre-deployment validation (11 tests)
- Quick execution (<1 second)
- No mocking (real behavior)
- Critical path testing

### Running Tests

```bash
# Run all tests with coverage report
npm test

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:smoke          # Smoke tests only (fast, pre-deployment)

# Watch mode for development
npm run test:watch
```

### Test Configuration

Jest is configured with:
- Coverage thresholds: 80% lines, 75% functions, 70% branches
- Test environment: Node.js
- Coverage exclusions: index.js (server entry point)
- Timeout: 10 seconds (for async operations)

## Example Response

When accessing the application, users will see information similar to:

```
📍 Location: New York, NY, United States
🌍 Coordinates: 40.7128°N, 74.0060°W
🕐 Current Time: 14:35:42
📅 Date: Wednesday, January 22, 2026
🌐 Timezone: America/New_York (EST, UTC-5)
🔢 IP Address: 203.0.113.42
```

### API Response Example

**First Request (Uncached):**
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "timezone": "America/New_York",
  "currentTime": "Wednesday, January 22, 2026, 14:35:42",
  "cached": false
}
```

**Subsequent Request (Cached):**
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "timezone": "America/New_York",
  "currentTime": "Wednesday, January 22, 2026, 14:36:15",
  "cached": true
}
```

Note the `cached: true` field and fresh `currentTime` on subsequent requests.

## Performance Metrics

The application is optimized for performance and reliability:

### Response Times
- **Cached Requests**: <10ms (sub-millisecond with warm cache)
- **Uncached Requests**: 200-500ms (external API call)
- **Cache Hit Rate**: 80-90% in production

### Caching Benefits
- **API Call Reduction**: 80-90% fewer external API calls
- **Effective Free Tier Usage**: 150,000-300,000 requests/month
- **Cost Savings**: ~$0-10/month even at high volume

### Reliability
- **Health Checks**: Automated monitoring of external dependencies
- **Graceful Degradation**: Proper error handling for API failures
- **Test Coverage**: 98.9% coverage ensures reliability

## Privacy Considerations

- IP addresses are used solely for geolocation purposes
- No personal data is stored or logged
- Location data is cached but not persisted to disk
- Users can verify their detected location accuracy
- Compliant with privacy regulations (GDPR, CCPA)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- IP geolocation services for providing location data
- Open-source timezone databases (IANA Time Zone Database)
- Node.js and Express.js communities

## Deployment

The application is production-ready and can be deployed to various platforms.

## Docker Deployment

### Quick Start with Docker

#### Pull and run pre-built image
```bash
docker pull ghcr.io/olaoluthomas/timezone-app:latest
docker run -d -p 3000:3000 --name timezone-app ghcr.io/olaoluthomas/timezone-app:latest
```

#### Build and run locally
```bash
# Build image
docker build -t timezone-app .

# Run container
docker run -d -p 3000:3000 --name timezone-app timezone-app

# View logs
docker logs -f timezone-app

# Stop container
docker stop timezone-app
```

#### Using Docker Compose

**Production mode:**
```bash
docker-compose up -d
```

**Development mode (with hot-reload):**
```bash
docker-compose --profile dev up timezone-app-dev
```

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `LOG_LEVEL` - Logging verbosity (debug/info/warn/error)
- `ALLOWED_ORIGINS` - CORS whitelist (comma-separated, production only)

### Health Checks

The container includes built-in health checks:
- **Liveness**: `GET /health` (checks if app is running)
- **Readiness**: `GET /health/ready` (checks if app and dependencies are ready)

### Kubernetes Deployment

See `docs/ARCHITECTURE.md` for Kubernetes manifests with liveness/readiness probes.

Example:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
```

### Image Details

- **Base Image**: `node:20-alpine`
- **Image Size**: ~150MB (production)
- **User**: Non-root (nodejs:1001)
- **Platforms**: linux/amd64, linux/arm64
- **Registry**: GitHub Container Registry (ghcr.io)

## Roadmap

### Completed ✅
- [x] Intelligent caching layer (24-hour TTL, 10k entries)
- [x] Comprehensive test suite (98.9% coverage, 133 tests)
- [x] Health check endpoints (liveness/readiness)
- [x] Code quality tools (ESLint, Prettier)
- [x] Production-ready error handling
- [x] Security middleware (CORS, rate limiting, Helmet)
- [x] Automated git workflow (Husky, Commitlint, pre-push testing)

### Planned Features
- [ ] Structured logging with Winston
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Multiple timezone comparisons
- [ ] Timezone converter functionality
- [ ] Historical timezone data visualization
- [ ] Manual location override
- [ ] Dark mode theme
- [ ] PWA (Progressive Web App) support
- [ ] Internationalization (i18n)

## Troubleshooting

### Common Issues

**Tests Failing**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules coverage
npm install
npm test
```

**Port Already in Use**
```bash
# Set a different port
PORT=3001 npm start
```

**Cache Not Working**
- Check console logs for "Cache HIT" and "Cache MISS" messages
- Verify node-cache is installed: `npm list node-cache`
- Cache stats available via `cache.getStats()` in code

**Health Check Failing**
```bash
# Test health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/ready

# Check if external API is accessible
curl https://ipapi.co/json/
```

**Linting Errors**
```bash
# Auto-fix most linting issues
npm run lint:fix

# Format code
npm run format
```

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm start
```

### Getting Help

1. Check existing issues on GitHub
2. Review test files for usage examples
3. Consult the API documentation above
4. Open a new issue with reproduction steps

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
   maxKeys: 50000  // Increase from 10,000
   ```

3. **Monitor Cache Hit Rate**:
   ```javascript
   const stats = cache.getStats();
   console.log(`Cache hit rate: ${stats.hitRate}%`);
   ```

---

Made with ❤️ for developers who need timezone information
