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

### 🤖 Proof of Concept: AI Agent Software Development

**This project serves as a Proof of Concept (PoC) to evaluate [Claude Code](https://github.com/anthropics/claude-code) capabilities in building production-quality software.**

The entire application—from initial setup to deployment infrastructure—was built using Claude Code (Sonnet 4.5) as an AI coding agent. This PoC aims to assess:

- **Code Quality**: Can AI agents write maintainable, well-structured code?
- **Best Practices**: Does AI follow industry standards, testing patterns, and security practices?
- **Documentation**: Can AI produce comprehensive, accurate documentation?
- **DevOps Integration**: Can AI set up proper CI/CD, containerization, and deployment workflows?
- **Problem Solving**: How well does AI handle complex architectural decisions and refactoring?

**Key Metrics Achieved:**
- ✅ **96.68% test coverage** with 213 passing tests (unit, integration, smoke)
- ✅ **Production-ready** with Docker, CI/CD, health monitoring, graceful shutdown
- ✅ **Zero breaking changes** through 9 completed milestones
- ✅ **Comprehensive documentation** (architecture, contributing, testing guides)
- ✅ **Security hardened** with rate limiting, CORS, security headers, container scanning

This project demonstrates that AI coding agents can build complete, production-ready applications with professional standards—from first commit to container orchestration planning.

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

## Quick Start
```bash
# Clone the repository
git clone https://github.com/olaoluthomas/timezone-app.git

# Navigate to the project directory
cd timezone-app

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
git clone https://github.com/olaoluthomas/timezone-app.git

# Navigate to the project directory
cd timezone-app

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

**Claude Code Router Configuration:**
- **QWEN3-4B-Instruct-2507** (open-source) - Default, background tasks, and web search operations
- **Llama 3.2 1B Instruct** - Quick edits, code formatting, documentation
- **QWEN 3 Coder 30B** - Complex refactoring, architectural decisions

**Anthropic API Models** (for advanced reasoning):
- **Claude Sonnet 4.5** - Architecture design, test strategy, complex implementations
- **Claude Haiku 4.5** - Quick validations, minor fixes, code reviews

**MCP Servers** (Model Context Protocol for enhanced capabilities):
- **Augment Code** - Advanced code search and retrieval across the codebase
- **GitHub** - Seamless integration for issue tracking, PR creation, and repository management

The combination of local open-source models, API models, and MCP servers enabled rapid, cost-effective development while maintaining high code quality and comprehensive test coverage. See [docs/development/DEVELOPMENT_TOOLS.md](docs/development/DEVELOPMENT_TOOLS.md) for details on the AI-assisted development workflow.

## Documentation

### Guides
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/ci-cd/DEPLOYMENT.md)
- [Development Guide](docs/development/DEVELOPMENT.md)
- [Configuration](docs/development/CONFIGURATION.md)
- [Testing](docs/ci-cd/CI-TESTING.md)
- [Troubleshooting](docs/development/TROUBLESHOOTING.md)

### Project Info
- [Architecture](docs/ARCHITECTURE.md)
- [Performance Metrics](docs/PERFORMANCE.md)
- [Roadmap](docs/planning/MILESTONE-ROADMAP.md)

## Contributing

Contributions are welcome! This project follows a **mandatory issue-first workflow** with technical safeguards.

### Quick Start
```bash
# 1. Create a GitHub issue (MANDATORY)
gh issue create --title "type: description" --label "type"

# 2. Create a branch (must reference issue number)
git checkout -b type/issue-N-description

# 3. Make changes and commit
git commit -m "type: description"

# 4. Push and create PR
git push -u origin type/issue-N-description
gh pr create --title "type: description (Fixes #N)"
```

### Important Notes
- **⚠️ Direct commits to main are blocked** by pre-commit hook
- **All branches must reference issue numbers**: `fix/issue-14-description`
- **All PRs must link to issues**: Use `Fixes #N` in title and description
- **Automated quality checks**: Code is auto-formatted and tested before push

For full details, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on the GitHub repository
- Include error messages and logs
- Provide Node.js version: `node --version`
- Include test output if applicable

Made with ❤️ for developers who need timezone information