# Local CI Testing Guide

## Overview

The `run-ci-tests.sh` script simulates the complete GitHub Actions CI pipeline locally, allowing you to verify all checks pass before pushing to the repository or proceeding to the next milestone.

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

## Integration with GitHub Actions

This script mirrors the `.github/workflows/ci.yml` workflow.

**Local checks:**
```bash
./run-ci-tests.sh  # Run locally
```

**Remote CI:**
```bash
git push origin feature-branch  # Triggers GitHub Actions
```

Both should produce identical results.

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

- ✅ `./run-ci-tests.sh` exits with code 0
- ✅ All tests passing (23/23 currently)
- ✅ Coverage ≥80%
- ✅ 0 ESLint errors
- ✅ No security vulnerabilities
- ✅ Code properly formatted

**Only when all checks pass, proceed to next milestone** ✅
