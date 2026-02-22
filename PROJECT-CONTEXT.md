# Timezone Web App

## Project Objective

Develop a high-performance, production-ready web application that displays a user's location, date, time, and timezone information based on IP geolocation.

## Features

### Core Features
The application determines the user's timezone and location using:
- IP address geolocation (primary method using ipapi.co)
- Real-time timezone detection and display
- Automatic time formatting in user's local timezone
- Location information (city, region, country, coordinates)

### Performance & Reliability Features
- **Intelligent Caching**: 24-hour TTL cache with 10,000 entry capacity
  - 80-90% cache hit rate in production
  - Sub-10ms response times for cached requests
  - Reduces external API calls by 80-90%
- **Health Monitoring**: Comprehensive health check endpoints
  - Liveness probe: `/health`
  - Readiness probe: `/health/ready` (checks external API and cache)
- **Error Handling**: Robust error handling with graceful degradation

### Developer Experience
- **Comprehensive Testing**: 96.06% test coverage with Jest
  - Unit tests for all services and middleware (89 tests)
  - Integration tests for API endpoints and security (55 tests)
  - Smoke tests for pre-deployment validation (11 tests)
  - Compression tests (12 tests)
  - 167 passing tests across 12 test suites
- **Code Quality Tools**: ESLint and Prettier with pre-commit hooks
- **Automated Workflow**: Git hooks enforce quality before push
- **CI/CD Ready**: GitHub Actions with 7 jobs on every push/PR
- **Structured Logging**: Winston logger with daily rotation (Milestone 6)
- **Well-Documented**: Comprehensive docs with refactoring tracking

## Current Implementation

The project includes:

### Backend Services
- **Express.js Server**: RESTful API with health endpoints
- **Geolocation Service**: IP-based timezone detection with caching
- **Cache Service**: LRU cache implementation using node-cache
- **Health Service**: Comprehensive health checks for dependencies

### API Endpoints
- `GET /api/timezone` - Returns timezone and location info for client IP
- `GET /health` - Liveness probe (basic health status)
- `GET /health/ready` - Readiness probe (comprehensive health checks)

### Testing Infrastructure
- Jest test framework with 100% code coverage
- Supertest for API endpoint testing
- Nock for HTTP mocking
- Coverage thresholds: 80% lines, 75% functions, 70% branches

### Code Quality
- ESLint configuration for consistent code style
- Prettier for automatic code formatting
- npm scripts for linting and formatting

### Git Workflow Automation
- **Husky Git Hooks**: Pre-commit and pre-push automation
- **Commitlint**: Enforces conventional commit format
- **Pre-Commit Hooks**: Auto-format and lint staged files
- **Pre-Push Testing**: Full test suite (133 tests) before push
- **PR Automation**: Automated PR creation with smart labels
- **GitHub CLI Integration**: Seamless PR workflow

## Project Structure

The timezone web app code is located in the `timezone/` directory.

```
timezone/
├── .github/
│   └── pull_request_template.md  # PR template
├── .husky/
│   ├── pre-commit               # Pre-commit hook
│   ├── pre-push                 # Pre-push hook
│   └── commit-msg               # Commit message validation
├── scripts/
│   ├── pre-commit.sh            # Pre-commit automation
│   ├── pre-push.sh              # Pre-push test execution
│   ├── create-pr.sh             # PR automation
│   └── setup-labels.sh          # GitHub label setup
├── src/
│   ├── index.js                 # Server entry point
│   ├── app.js                   # Express app configuration
│   ├── config/
│   │   └── constants.js         # Centralized constants (NEW)
│   ├── middleware/
│   │   ├── cors.js              # CORS middleware
│   │   ├── rate-limit.js        # Rate limiting
│   │   ├── timeout.js           # Request timeout
│   │   └── compression.js       # Gzip compression (NEW)
│   ├── services/
│   │   ├── geolocation.js       # Geolocation with caching
│   │   ├── cache.js             # Cache service
│   │   └── health.js            # Health check service
│   ├── utils/
│   │   └── logger.js            # Winston logger (NEW)
│   └── public/
│       └── index.html           # Frontend interface
├── tests/
│   ├── unit/                    # 89 unit tests
│   ├── integration/             # 55 integration tests
│   └── smoke/                   # 11 smoke tests + compression
├── docs/
│   ├── MILESTONES.md            # 8/9 milestones complete (89%)
│   ├── ARCHITECTURE.md          # System design documentation
│   ├── REFACTORING_OPPORTUNITIES.md  # Original refactoring analysis
│   ├── REFACTORING_STATUS_2026-01-26.md  # Current status (NEW)
│   ├── CI-TESTING.md            # Testing strategy and CI/CD
│   ├── CI-CD-IMPROVEMENTS.md    # Pipeline enhancement tracking
│   ├── SECURITY-IMPROVEMENTS.md # Security enhancement tracking
│   ├── FEATURE-BACKLOG.md       # Feature planning
│   └── WORKFLOW-IMPROVEMENTS.md # Process improvements
├── .eslintrc.js
├── .prettierrc
├── commitlint.config.js
├── jest.config.js
└── package.json
```

## Development Commands

```bash
# Start development server (with hot-reload)
npm run dev

# Start production server
npm start

# Run all tests with coverage
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run smoke tests only
npm run test:smoke

# Git workflow commands
git commit -m "feat: your feature"  # Auto-formatted and linted
git push                            # Auto-tested (133 tests)
npm run create-pr                   # Create PR with labels

# Code quality
npm run lint
npm run lint:fix
npm run format
```

## Performance Metrics

- **Cached Requests**: <10ms response time
- **Uncached Requests**: 200-500ms (external API call)
- **Cache Hit Rate**: 80-90% in production
- **Free Tier Support**: 150,000-300,000 requests/month
- **Test Coverage**: 96.06% (167 tests passing)
- **Response Compression**: Gzip for responses >1KB (saves bandwidth)
- **CI/CD Pipeline**: ~15 second test suite (167 tests)

## Production Ready

The application is production-ready with:
- ✅ Docker deployment support (Dockerfile, docker-compose.yml, .dockerignore)
- ✅ Container CI/CD (GitHub Actions workflow, GHCR publishing, multi-arch builds)
- ✅ Container security scanning (Trivy vulnerability scanning, SARIF integration)
- ✅ Kubernetes health probe configuration (/health, /health/ready)
- ✅ Environment-based configuration with centralized constants
- ✅ Comprehensive error handling
- ✅ Structured logging with Winston (daily rotation)
- ✅ Response compression (gzip)
- ✅ GitHub Actions CI/CD (7 jobs, Node 18.x & 20.x)
- ✅ No API keys required (using ipapi.co free tier)
- ✅ **Graceful shutdown** (SIGTERM/SIGINT/uncaughtException/unhandledRejection) - Zero-downtime deployments ready

## Current Status (2026-02-14)

- **Core Milestones**: 9/9 complete (100%) 🎉
- **Post-Production Milestones**: 3 active (Milestones 10-12) 📋
- **Current Phase**: Phase 2 - Code Quality & Infrastructure
- **Next Milestone**: Milestone 10 - Code Quality & Developer Experience (5 issues)
- **Tests**: 213 passing (96.68% coverage)
- **Open Issues**: 16 total
  - 🔥 **P0 - Next Sprint (M10)**: 5 issues (#34, #35, #36, #38, #39)
  - 📋 **P1 - Future (M11)**: 5 issues (#71-75) - UI Enhancements
  - 🔮 **P2 - Later (M12)**: 5 issues (#30, #76-79) - Analytics & Monitoring
  - ⏸️ **Backlog**: 1 issue (#32) - Maintenance tasks
- **Project Board**: [Timezone App - AI-assisted](https://github.com/users/olaoluthomas/projects/3)
- **CI/CD**: Fully automated with GitHub Actions
- **Documentation**: Comprehensive tracking docs updated, roadmap created

### Milestone 10 Execution Sequence
1. **#38**: Add request/response logging middleware (Quick win)
2. **#39**: Centralize configuration management (Foundational)
3. **#36**: Add centralized error handler (Depends on #39)
4. **#35**: Extract route handlers to controllers (Larger refactor)
5. **#34**: Extract test helper utilities (Parallel work)

## Development Workflow (SoP - MANDATORY)

**⚠️ CRITICAL: All code changes MUST follow the issue-first workflow.**

**🛡️ TECHNICAL SAFEGUARD: Direct commits to main are BLOCKED by pre-commit hook.**

📖 **Quick Reference**: See [WORKFLOW.md](WORKFLOW.md) for step-by-step guide.

### Issue-First Workflow

Before making any code changes for bugs, features, or enhancements:

1. **Create a GitHub Issue** (mandatory)
   ```
   # Preferred: GitHub MCP issue_write (method: create, owner: olaoluthomas, repo: timezone-app)
   # Fallback:  gh issue create --title "fix: Brief description" --label "bug"
   ```

2. **Create a branch referencing the issue**
   ```bash
   git checkout -b fix/issue-N-short-description
   # OR
   git checkout -b feat/issue-N-short-description
   ```

3. **Make changes and commit**
   ```bash
   git commit -m "fix: description of changes"
   ```

4. **Push and create PR**
   ```bash
   git push -u origin branch-name
   ```
   ```
   # Preferred: GitHub MCP create_pull_request (with labels)
   # Fallback:  npm run create-pr
   ```

### Branch Naming Convention

All branches must include the issue number:
- `fix/issue-14-rate-limit-localhost` - Bug fixes
- `feat/issue-42-add-authentication` - New features
- `refactor/issue-67-extract-constants` - Refactoring
- `docs/issue-88-update-readme` - Documentation

### Exceptions

Issue creation is optional ONLY for:
- Trivial typo fixes or formatting (use `chore:` prefix)
- Whitespace/comment-only changes
- Urgent production hotfixes (create issue retroactively)

### PR Requirements

All PRs must:
- Reference the issue number in the title: `(Closes #N)` or `(Fixes #N)`
- Include "Closes #N" or "Fixes #N" in the PR description
- Follow conventional commit format
- Pass all CI checks

**Example PR Title:**
```
fix: resolve CommonJS/ESM incompatibility from ESLint migration (Fixes #15)
```

### Why This Matters

- ✅ Proper tracking and searchability
- ✅ Discussion before implementation
- ✅ Clear context for future developers
- ✅ GitHub auto-closes issues when PRs merge
- ✅ Better project history and accountability

### Documentation

See **CONTRIBUTING.md** for complete workflow details.
