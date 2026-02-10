# CI/CD Testing Guide

## Overview

This guide covers both **local CI testing** and **GitHub Actions CI/CD** for the Timezone App. The project includes automated testing at two levels:

1. **Local CI Script** (`run-ci-tests.sh`) - Run the full CI pipeline locally before pushing
2. **GitHub Actions Workflow** (`.github/workflows/ci.yml`) - Automated CI/CD on every push and PR

Both systems run identical checks to ensure consistent quality validation.

## Usage

### Basic Usage

```bash
./run-ci-tests.sh
```

This runs all CI checks in sequence:
1. 📦 Clean dependency installation (`npm ci`)
2. 🔍 ESLint checks
3. ✨ Code formatting verification
4. 🔒 Security audit
5. 🧪 Unit tests with coverage
6. 🔗 Integration tests (if implemented)
7. 💨 Smoke tests (if implemented)
8. 📊 Full coverage report

### Exit Codes

- **0** - All tests passed ✅
- **1** - One or more tests failed ❌

### Script Features

✅ **Color-coded output** - Easy to spot failures
✅ **Detailed step reporting** - Know exactly what's running
✅ **Graceful handling** - Skips unimplemented test suites
✅ **Full simulation** - Matches GitHub Actions workflow

## When to Run

### Required: After Every Milestone

Before marking any milestone as complete, run:

```bash
./run-ci-tests.sh
```

**Only proceed to the next milestone when this passes** ✅

### Quick Checks During Development

For faster feedback during development, run individual checks:

```bash
# Quick test run
npm test

# Lint only
npm run lint

# Format check only
npm run format:check

# Unit tests only
npm run test:unit
```

## Milestone Workflow

```
┌─────────────────────────┐
│ Implement Feature       │
│ + Write Tests           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ npm test                │  ← Quick check
│ npm run lint            │
└────────┬────────────────┘
         │
         ▼
    Pass? ─No─→ Fix Issues ─┐
         │                  │
        Yes                 │
         │                  │
         ▼                  │
┌─────────────────────────┐│
│ ./run-ci-tests.sh       ││
└────────┬────────────────┘│
         │                  │
         ▼                  │
    Pass? ─No──────────────┘
         │
        Yes
         │
         ▼
┌─────────────────────────┐
│ ✅ Milestone Complete   │
│ Proceed to Next         │
└─────────────────────────┘
```

## CI Checks Explained

### 1. Clean Install (`npm ci`)

- Removes `node_modules` and reinstalls from `package-lock.json`
- Ensures consistent dependencies
- Catches missing dependencies

### 2. ESLint

```bash
npm run lint
```

**Checks for:**
- Code quality issues
- Potential bugs
- Style violations
- Unused variables

**Acceptance criteria:**
- 0 errors required
- Warnings acceptable (e.g., console.log)

### 3. Prettier Formatting

```bash
npm run format:check
```

**Checks for:**
- Consistent code style
- Proper indentation
- Quote style consistency

**Acceptance criteria:**
- All files must follow Prettier rules
- Run `npm run format` to auto-fix

### 4. Security Audit

```bash
npm audit --audit-level=moderate
```

**Checks for:**
- Known vulnerabilities in dependencies
- Moderate or higher severity issues

**Acceptance criteria:**
- No high or critical vulnerabilities

### 5. Unit Tests

```bash
npm run test:unit -- --coverage
```

**Checks for:**
- Individual function/module correctness
- Edge cases
- Error handling

**Acceptance criteria:**
- All tests pass
- ≥80% code coverage
- No skipped tests

### 6. Integration Tests

```bash
npm run test:integration
```

**Checks for:**
- API endpoint functionality
- Request/response handling
- Middleware integration

**Acceptance criteria:**
- All tests pass
- Real HTTP requests tested
- Error scenarios covered

### 7. Smoke Tests

```bash
npm run test:smoke
```

**Checks for:**
- Server starts successfully
- Critical paths functional
- Basic health checks

**Acceptance criteria:**
- All critical paths pass
- Fast execution (<30s)

### 8. Full Coverage Report

```bash
npm test -- --coverage
```

**Generates:**
- Complete coverage report
- HTML report in `coverage/` directory
- Summary in terminal

**Acceptance criteria:**
- Overall coverage ≥80%
- No uncovered critical code

## Troubleshooting

### Issue: Script not executable

```bash
chmod +x run-ci-tests.sh
```

### Issue: npm ci fails

```bash
rm -rf node_modules package-lock.json
npm install
npm test  # Verify tests still pass
```

### Issue: Tests fail but npm test passes

The script uses `npm ci` which does a clean install. Your local `node_modules` may differ from `package-lock.json`.

**Solution:**
```bash
rm -rf node_modules
npm ci
npm test
```

### Issue: Coverage below threshold

Check the coverage report:

```bash
open coverage/lcov-report/index.html
```

Identify uncovered lines and add tests.

## GitHub Actions CI/CD

### Overview

The project includes a comprehensive GitHub Actions workflow that automatically runs on every push and pull request. The workflow includes 7 jobs that test the application on both Node.js 18.x and 20.x.

**Workflow File:** `.github/workflows/ci.yml`

### Workflow Triggers

The CI workflow runs automatically on:

1. **Push to any branch**
   ```bash
   git push origin feature-branch  # Triggers CI automatically
   ```

2. **Pull requests to main**
   ```bash
   gh pr create --base main  # CI runs on PR creation
   ```

3. **Manual dispatch** (for ci/* branches)
   ```bash
   gh workflow run ci.yml --ref ci/test-feature
   ```

### CI Jobs

The workflow includes 7 jobs that run in parallel where possible:

#### 1. Lint Job (Node 20.x)
```yaml
- ESLint code quality check
- Prettier format verification
- No matrix (runs once on Node 20.x)
```

#### 2. Security Job (Node 20.x)
```yaml
- npm audit (moderate+ severity)
- Dependency vulnerability scanning
- No matrix (runs once on Node 20.x)
```

#### 3. Unit Tests (Node 18.x & 20.x)
```yaml
- Run unit tests with coverage
- Matrix: Node 18.x and 20.x
- Total: 2 job runs
```

#### 4. Integration Tests (Node 18.x & 20.x)
```yaml
- API and security integration tests
- Matrix: Node 18.x and 20.x
- Total: 2 job runs
```

#### 5. Smoke Tests (Node 18.x & 20.x)
```yaml
- Pre-deployment validation tests
- Matrix: Node 18.x and 20.x
- Total: 2 job runs
```

#### 6. Coverage Job (Node 20.x)
```yaml
- Full test coverage report
- Enforces 80/75/70 thresholds
- Uploads coverage artifact (30-day retention)
- Depends on: unit, integration, smoke tests
```

#### 7. Build Job (Node 20.x)
```yaml
- Verify app starts successfully
- 10-second startup test
- No matrix (runs once on Node 20.x)
```

### Job Execution Flow

```
┌──────────┐  ┌──────────┐
│   Lint   │  │ Security │
└────┬─────┘  └────┬─────┘
     │             │
     └─────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Test Matrix │
    │  (18.x,20.x) │
    ├──────────────┤
    │ Unit Tests   │
    │ Integration  │
    │ Smoke Tests  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Coverage    │
    │  (20.x)      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │    Build     │
    │  (20.x)      │
    └──────────────┘
```

### Viewing Workflow Status

#### Check CI Status on GitHub

1. **Via GitHub UI:**
   - Go to repository → Actions tab
   - View all workflow runs
   - Click on any run to see detailed logs

2. **Via GitHub CLI:**
   ```bash
   # List recent workflow runs
   gh run list --workflow=ci.yml

   # View specific run details
   gh run view <run-id>

   # Watch a running workflow
   gh run watch <run-id>
   ```

3. **Via CI Badge:**
   - Check README.md for live CI status badge
   - Green = passing, Red = failing

#### Download Coverage Report

```bash
# List artifacts from latest run
gh run list --workflow=ci.yml --limit 1

# Download coverage artifact
gh run download <run-id> -n coverage-report
```

### Workflow Optimizations

The workflow includes several optimizations for performance:

1. **Dependency Caching**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```
   - Caches npm dependencies
   - Reduces install time by 30-60%
   - Separate cache per Node version

2. **Concurrency Control**
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```
   - Cancels outdated runs on new pushes
   - Saves CI minutes
   - Focuses on latest code

3. **Matrix Strategy**
   ```yaml
   strategy:
     matrix:
       node-version: [18.x, 20.x]
     fail-fast: false
   ```
   - Tests both Node versions in parallel
   - `fail-fast: false` shows all results
   - Total: 13 job runs per workflow

### Integration with Local CI

This script mirrors the `.github/workflows/ci.yml` workflow.

**Local checks (before pushing):**
```bash
./run-ci-tests.sh  # Run locally (15-20s)
```

**Remote CI (after pushing):**
```bash
git push origin feature-branch  # Triggers GitHub Actions (2-3 min)
```

Both should produce identical results. Local checks are faster and catch issues before pushing.

### CI Workflow Best Practices

1. **Test Locally First**
   ```bash
   ./run-ci-tests.sh  # Quick local validation
   git push           # Then push to trigger remote CI
   ```

2. **Monitor First Run**
   - Watch the first workflow run on new branches
   - Verify all jobs pass
   - Fix any environment-specific issues

3. **Use Draft PRs**
   ```bash
   gh pr create --draft  # Run CI without requesting reviews
   ```
   - CI runs on draft PRs
   - Convert to ready when CI passes

4. **Review Failed Jobs**
   ```bash
   gh run view <run-id> --log-failed  # View only failed job logs
   ```

5. **Re-run Failed Jobs**
   - GitHub UI: Click "Re-run failed jobs"
   - Useful for transient failures (network issues, API rate limits)

### CI Performance Metrics

**Expected Execution Times:**

| Job | Node 18.x | Node 20.x | Total |
|-----|-----------|-----------|-------|
| Lint | - | 30-45s | 30-45s |
| Security | - | 20-30s | 20-30s |
| Unit Tests | 30-40s | 30-40s | 1-1.5 min |
| Integration | 25-35s | 25-35s | 50-70s |
| Smoke | 15-20s | 15-20s | 30-40s |
| Coverage | - | 40-50s | 40-50s |
| Build | - | 20-30s | 20-30s |
| **Total** | | | **2-3 min** |

**Caching Benefits:**
- Without cache: 45-60s install time
- With cache: 10-15s install time
- Savings: ~70% on dependency installation

### Troubleshooting CI Failures

#### Failed Lint Job
```bash
# Reproduce locally
npm run lint
npm run format:check

# Fix
npm run lint:fix
npm run format
```

#### Failed Security Audit
```bash
# Check vulnerabilities
npm audit

# Update dependencies
npm audit fix

# Review breaking changes
npm audit fix --force
```

#### Failed Tests (specific Node version)
```bash
# Use nvm to test specific version
nvm install 18
nvm use 18
npm test

nvm install 20
nvm use 20
npm test
```

#### Failed Coverage Threshold
```bash
# View coverage report locally
npm test
open coverage/lcov-report/index.html

# Add tests to uncovered code
```

#### Failed Build Job
```bash
# Test app startup locally
timeout 10s npm start || echo "Startup verification"

# Check for syntax errors or missing dependencies
npm ci
node src/index.js
```

### GitHub Actions Free Tier

**Limits:**
- Public repositories: **2,000 minutes/month** (free)
- Private repositories: **500 minutes/month** (free tier), then $0.008/minute

**Our Usage:**
- ~2-3 minutes per workflow run
- ~600-1000 runs/month possible (well within free tier)
- Caching reduces runtime by 30-50%

### CI Status Badge

The README includes a CI status badge:

```markdown
[![CI](https://github.com/olaoluthomas/timezone-app/workflows/CI/badge.svg)](https://github.com/olaoluthomas/timezone-app/actions)
```

**Badge States:**
- 🟢 **passing** - All jobs passed
- 🔴 **failing** - One or more jobs failed
- 🟡 **running** - Workflow in progress
- ⚪ **no status** - No recent runs

## Best Practices

1. **Run before pushing**
   ```bash
   ./run-ci-tests.sh && git push
   ```

2. **Run after each milestone**
   - Mark milestone complete only when script passes
   - Prevents regression accumulation

3. **Fix issues immediately**
   - Don't proceed with failures
   - Compound issues are harder to debug

4. **Keep coverage high**
   - Add tests for new features
   - Maintain ≥80% coverage

5. **Monitor script output**
   - Read warnings carefully
   - Address deprecation notices

## Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `./run-ci-tests.sh` | Full CI simulation | Before milestone completion |
| `npm test` | Run all tests | Quick verification |
| `npm run lint` | Check code quality | After code changes |
| `npm run format` | Auto-fix formatting | Before committing |
| `npm audit` | Security check | Weekly/before release |

## Success Criteria

Before proceeding to next milestone, ensure:

### Local CI
- ✅ `./run-ci-tests.sh` exits with code 0
- ✅ All tests passing (167/167 currently)
- ✅ Coverage ≥80%
- ✅ 0 ESLint errors
- ✅ No security vulnerabilities
- ✅ Code properly formatted

### GitHub Actions CI
- ✅ All 7 jobs passing (13 with matrix)
- ✅ Lint job passes (Node 20.x)
- ✅ Security audit passes (Node 20.x)
- ✅ Unit tests pass (Node 18.x & 20.x)
- ✅ Integration tests pass (Node 18.x & 20.x)
- ✅ Smoke tests pass (Node 18.x & 20.x)
- ✅ Coverage job passes with thresholds (Node 20.x)
- ✅ Build verification passes (Node 20.x)
- ✅ CI badge shows "passing" status

**Only when all checks pass (both local and remote), proceed to next milestone** ✅

---

## Summary

The Timezone App uses a **two-tier CI/CD approach**:

1. **Local CI** (`./run-ci-tests.sh`) - Fast feedback (15-20s) before pushing
2. **GitHub Actions** (`.github/workflows/ci.yml`) - Comprehensive validation (2-3 min) on push/PR

This approach ensures:
- 🚀 **Fast feedback** during development (local)
- 🔒 **Comprehensive validation** before merge (remote)
- 🌐 **Multi-version compatibility** (Node 18.x & 20.x)
- ✅ **Production confidence** (all checks must pass)

**Recommended workflow:**
```bash
# 1. Develop feature
vim src/services/new-feature.js

# 2. Run quick tests
npm test

# 3. Run local CI
./run-ci-tests.sh

# 4. Push (triggers GitHub Actions)
git push origin feature-branch

# 5. Monitor remote CI
gh run watch

# 6. Create PR when CI passes
npm run create-pr
```
