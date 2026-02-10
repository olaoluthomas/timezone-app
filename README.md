# Timezone App

[![CI](https://github.com/olaoluthomas/timezone-app/workflows/CI/badge.svg)](https://github.com/olaoluthomas/timezone-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-96.06%25-brightgreen)](https://github.com/olaoluthomas/timezone-app)
[![Tests](https://img.shields.io/badge/tests-167%20passing-brightgreen)](https://github.com/olaoluthomas/timezone-app)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-5A67D8)](https://github.com/anthropics/claude-code)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A production-ready application that automatically detects and displays timezone information based on IP geolocation.

## Overview

Built entirely with [Claude Code](https://github.com/anthropics/claude-code) as a PoC for AI-assisted software development. Features comprehensive testing (96.68% coverage), intelligent caching, health monitoring, and security hardening—demonstrating that AI agents can build production-ready applications following industry best practices.

## Features

- **Automatic timezone detection** via IP geolocation
- **Intelligent caching** (24h TTL, 80-90% hit rate) reduces API calls
- **Health monitoring** with liveness/readiness probes
- **Security hardened** (rate limiting, CORS, Helmet.js)
- **96.68% test coverage** with 213 passing tests
- **Production-ready** with Docker, CI/CD, graceful shutdown

## Quick Start

```bash
git clone https://github.com/olaoluthomas/timezone-app.git
cd timezone-app
npm install
npm start
# Open http://localhost:3000
```

## Installation

**Prerequisites:** Node.js 18+ or 20+

```bash
git clone https://github.com/olaoluthomas/timezone-app.git
cd timezone-app
npm install
cp .env.example .env  # Optional
```

## Usage

```bash
npm run dev              # Development with hot-reload
npm start                # Production
npm test                 # Run tests
npm run lint             # Check code quality
```

## API Endpoints

- **`GET /api/timezone`** - Returns timezone and location data for requesting IP
- **`GET /health`** - Liveness probe (basic health status)
- **`GET /health/ready`** - Readiness probe (comprehensive checks)

See [API Documentation](docs/API.md) for detailed request/response formats.

## Configuration

Create `.env` file:
```env
PORT=3000
NODE_ENV=production
```

See [Configuration Guide](docs/development/CONFIGURATION.md) for advanced options.

## Technology Stack

**Core:** Node.js, Express.js, Axios, node-cache, ipapi.co API \
**Testing:** Jest, Supertest, Nock \
**Quality:** ESLint, Prettier, Husky

**Built with AI:**
- Claude Code (Anthropic CLI) with Sonnet 4.5
- Claude Code Router (QWEN, Llama, local models)
- MCP Servers (Augment Code, GitHub)

## Documentation

### Guides
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/ci-cd/DEPLOYMENT.md)
- [Configuration](docs/development/CONFIGURATION.md)
- [Troubleshooting](docs/development/TROUBLESHOOTING.md)
- [Testing](docs/ci-cd/CI-TESTING.md)

### Project Info
- [Architecture](docs/ARCHITECTURE.md)
- [Performance Metrics](docs/PERFORMANCE.md)
- [Roadmap](docs/planning/MILESTONE-ROADMAP.md)

## Contributing

Contributions welcome! Follow the **mandatory issue-first workflow**:

```bash
gh issue create --title "type: description" --label "type"
git checkout -b type/issue-N-description
git commit -m "type: description"
git push -u origin type/issue-N-description
gh pr create --title "type: description (Fixes #N)"
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

## License

MIT License - see [LICENSE](LICENSE) file.

## Support

For issues or questions:
- Open an issue on GitHub
- Include error messages, logs, and Node.js version
- Check [Troubleshooting Guide](docs/development/TROUBLESHOOTING.md)

---

Made with ❤️ for developers who need timezone information
