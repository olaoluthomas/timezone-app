# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server (with hot-reload)
npm run dev

# Start production server
npm start
```

---

## Development Workflow

### 1. Before Making Changes

```bash
# Ensure you're starting from a clean state
npm test                    # All tests should pass
npm run lint                # No linting errors
npm run format:check        # Code properly formatted
```

### 2. During Development

```bash
# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only

# Check code quality
npm run lint                # Check for linting errors
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format code with Prettier
```

### 3. Before Committing

```bash
# Run the full CI test suite locally
./run-ci-tests.sh

# This runs:
# - npm ci (clean install)
# - npm run lint
# - npm run format:check
# - npm audit --audit-level=moderate
# - npm run test:unit --coverage
# - npm run test:integration
# - npm test --coverage
```

---

## Testing Strategy

### Unit Tests (`tests/unit/`)
- Test individual functions and modules in isolation
- Mock external dependencies
- Fast execution (<1s)
- **Location:** `tests/unit/services/`
- **Run:** `npm run test:unit`

**Example:**
```javascript
// tests/unit/services/cache.test.js
describe('CacheService', () => {
  it('should store and retrieve a value', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});
```

### Integration Tests (`tests/integration/`)
- Test API endpoints end-to-end
- Use supertest for HTTP requests
- Mock external APIs with nock
- **Location:** `tests/integration/api/`
- **Run:** `npm run test:integration`

**Example:**
```javascript
// tests/integration/api/health.test.js
describe('GET /health', () => {
  it('should return 200 with status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

### Test Coverage Requirements
- **Overall:** ≥80% line coverage
- **Functions:** ≥75% coverage
- **Branches:** ≥70% coverage
- **Statements:** ≥80% coverage

Run coverage report:
```bash
npm test -- --coverage
```

---

## Code Quality

### ESLint
- **Config:** `.eslintrc.js`
- **Rules:** eslint:recommended
- **Environment:** Node.js, ES2021, Jest

**Commands:**
```bash
npm run lint                # Check for errors
npm run lint:fix            # Auto-fix issues
```

**Common Warnings:**
- `no-console`: console.log usage (will be replaced with winston logger)

### Prettier
- **Config:** `.prettierrc`
- **Style:** Single quotes, semicolons, 2-space tabs

**Commands:**
```bash
npm run format:check        # Check formatting
npm run format              # Format all files
```

---

## Project Structure

```
timezone/
├── src/
│   ├── index.js              # Server entry point
│   ├── app.js                # Express app configuration
│   ├── services/             # Business logic
│   │   ├── cache.js          # Cache service
│   │   ├── geolocation.js    # Geolocation service
│   │   └── health.js         # Health check service
│   └── public/               # Static files
│       └── index.html        # Frontend
├── tests/
│   ├── unit/                 # Unit tests
│   │   └── services/
│   └── integration/          # Integration tests
│       └── api/
├── docs/                     # Documentation
│   ├── MILESTONES.md         # Milestone tracker
│   ├── CI-TESTING.md         # CI testing guide
│   └── DEVELOPMENT.md        # This file
├── scripts/                  # Utility scripts
│   └── test-caching.js       # Manual cache testing
├── .eslintrc.js              # ESLint config
├── .prettierrc               # Prettier config
├── jest.config.js            # Jest config
├── package.json              # Dependencies & scripts
└── README.md                 # Main README
```

---

## Adding New Features

### 1. Plan the Feature
- Document in `docs/MILESTONES.md` if it's a milestone
- Identify files to modify
- Consider test strategy
- Check dependencies needed

### 2. Write Tests First (TDD)
```bash
# Create test file
touch tests/unit/services/my-feature.test.js

# Write failing tests
npm run test:watch
```

### 3. Implement Feature
- Write minimal code to pass tests
- Follow existing code style
- Add JSDoc comments for functions
- Keep functions small and focused

### 4. Verify Quality
```bash
npm test                    # All tests pass
npm run lint                # No new errors
npm run format              # Code formatted
```

### 5. Update Documentation
- Update README.md if user-facing
- Update MILESTONES.md if part of milestone
- Add inline comments for complex logic

---

## Common Tasks

### Running the Server

**Development (with hot-reload):**
```bash
npm run dev
# Server runs on http://localhost:3000
# Auto-restarts on file changes
```

**Production:**
```bash
npm start
# Server runs on http://localhost:3000
# No auto-restart
```

### Testing Endpoints

**Health Checks:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
```

**API Endpoint:**
```bash
curl http://localhost:3000/api/timezone
```

**Cache Testing:**
```bash
node scripts/test-caching.js
```

### Debugging

**Enable Verbose Logging:**
```bash
NODE_ENV=development npm start
```

**Run Tests with Debugging:**
```bash
npm test -- --verbose
npm test -- --detectOpenHandles  # Find leaked handles
```

---

## Environment Variables

**Development (.env):**
```env
PORT=3000
NODE_ENV=development
```

**Production:**
```env
PORT=3000
NODE_ENV=production
```

**Note:** Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

---

## Troubleshooting

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules coverage
npm install
npm test
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### Linting Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

### Cache Not Working

```bash
# Check cache logs
node scripts/test-caching.js

# Run cache tests
npm run test:unit -- cache
```

---

## Git Workflow

### Before Committing

1. Run full CI suite: `./run-ci-tests.sh`
2. Ensure all tests pass
3. Verify code quality
4. Update documentation

### Commit Message Format

```
<type>: <short description>

<optional detailed description>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add or update tests
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `chore`: Build/config changes

**Examples:**
```
feat: add caching layer with 24-hour TTL

Implements in-memory caching using node-cache to reduce
external API calls by 80-90%.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Performance Optimization

### Cache Performance

**Check Cache Stats:**
```javascript
const cache = require('./src/services/cache');
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

**Tune Cache Settings:**
```javascript
// src/services/cache.js
stdTTL: 86400,    // 24 hours
maxKeys: 10000,   // Max cached entries
```

### Response Times

**Measure Response Time:**
```bash
time curl http://localhost:3000/api/timezone
```

**Expected:**
- Cached: <10ms
- Uncached: 200-500ms

---

## Security

### Audit Dependencies

```bash
npm audit                       # Show vulnerabilities
npm audit fix                   # Auto-fix vulnerabilities
npm audit --audit-level=high    # Only show high/critical
```

### Update Dependencies

```bash
npm outdated                    # Check for updates
npm update                      # Update minor versions
```

---

## CI/CD

### Local CI Simulation

```bash
./run-ci-tests.sh
```

This simulates the GitHub Actions workflow locally.

### GitHub Actions (Future)

Will run automatically on:
- Push to main/develop
- Pull requests
- Manual triggers

**Jobs:**
- Lint & format check
- Security audit
- Unit tests (Node 18.x, 20.x)
- Integration tests
- Build verification

---

## Resources

- **Main README:** `../README.md`
- **Milestone Tracker:** `docs/MILESTONES.md`
- **CI Testing Guide:** `docs/CI-TESTING.md`
- **Plan File:** `/Users/simeon/.claude/plans/transient-soaring-firefly.md`
- **Project Instructions:** `/Users/simeon/Projects/Agents_GenAI/playground/CLAUDE.md`

---

## Getting Help

1. Check test files for usage examples
2. Review existing code patterns
3. Consult documentation
4. Run tests in watch mode for fast feedback
5. Check error messages carefully

---

**Last Updated:** 2026-01-23
