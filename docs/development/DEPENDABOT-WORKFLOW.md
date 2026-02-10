# Dependabot Workflow & Automation

**Last Updated:** 2026-01-26
**Purpose:** Standard operating procedure for handling Dependabot PRs

---

## Quick Summary

**Current Status:**
- ✅ Dependabot configured (weekly updates)
- ✅ "automated" label created for bot PRs
- ✅ 3 PRs merged successfully (2026-01-26)
- ✅ 1 PR resolved via manual migration (ESLint 9)
- ⚠️ 1 PR blocked (requires manual intervention)

---

## Automated Label

**Label:** `automated`
**Color:** #0366D6 (blue)
**Description:** Automated updates from bots (Dependabot, Renovate, etc.)

**Purpose:**
- Identify PRs created by automation tools
- Filter PRs for automated review workflows
- Track dependency update velocity

**Usage:**
- Automatically applied to all Dependabot PRs
- Can be combined with other labels (e.g., `dependencies`, `tests`)
- Use for GitHub Actions workflows targeting automated PRs

**Filter Commands:**
```bash
# List all automated PRs
gh pr list --label "automated"

# List automated dependency PRs
gh pr list --label "automated,dependencies"

# Count automated PRs
gh pr list --label "automated" --json number --jq 'length'
```

---

## Dependabot PR Testing Workflow

### Step 1: Review New PRs

```bash
# Check for new Dependabot PRs
gh pr list --author "app/dependabot" --state open

# Get PR details
gh pr view <NUMBER> --json number,title,additions,deletions,headRefName
```

### Step 2: Apply Labels

```bash
# Add automated and dependencies labels
gh pr edit <NUMBER> --add-label "automated,dependencies"

# Add additional context labels as needed
gh pr edit <NUMBER> --add-label "tests"  # if test changes
gh pr edit <NUMBER> --add-label "code"   # if source code changes
```

### Step 3: Local Testing

```bash
# Fetch and checkout the PR branch
git fetch origin <branch-name>
git checkout <branch-name>

# Install dependencies
npm install

# Run full test suite
npm test

# Run linting
npm run lint

# Run security audit
npm audit

# Verify no breaking changes
npm run test:integration
```

### Step 4: Decision Matrix

| Scenario | Action | Notes |
|----------|--------|-------|
| ✅ All tests pass | Merge immediately | Use `gh pr merge <NUMBER> --merge --delete-branch` |
| ❌ Tests fail (minor) | Fix and merge | Update tests if breaking changes are minor |
| ❌ Tests fail (major) | Block and document | Create issue for migration work |
| ⚠️ Major version bump | Review changelog | Check for breaking changes first |
| 🔒 Security update | Prioritize merge | Even with minor issues, consider security |

### Step 5: Merge or Block

**If Passing:**
```bash
# Merge PR
gh pr merge <NUMBER> --merge --delete-branch

# Update local main
git checkout main
git pull origin main

# Verify post-merge
npm install
npm test
```

**If Blocked:**
```bash
# Add comment explaining why
gh pr comment <NUMBER> --body "Blocked: <reason>. See issue #<NUMBER> for migration plan."

# Create tracking issue
gh issue create --title "Migration: <package> to v<version>" --body "..." --label "dependencies,refactor"

# Keep PR open for reference
```

---

## Current Dependabot PRs Status

### ✅ Merged PRs (2026-01-26)

| PR # | Package | Version | Merged At | Status |
|------|---------|---------|-----------|--------|
| #9 | axios | 1.13.2 → 1.13.3 | 16:34:30 UTC | Production dependency ✅ |
| #10 | supertest | 6.3.4 → 7.2.2 | 16:34:43 UTC | Dev dependency ✅ |
| #11 | @commitlint/config-conventional | 18.6.3 → 20.3.1 | 16:34:57 UTC | Dev dependency ✅ |

**Result:** All tests passing (184/184), 0 vulnerabilities

---

### ✅ Resolved PRs (Manual Migration)

#### PR #12: ESLint 8 → 9 (RESOLVED - 2026-01-26)

**Status:** ✅ RESOLVED - Migration completed manually
**Reason:** ESLint 9 required new flat config format
**Completed Work:**
1. ✅ Migrated `.eslintrc.js` to `eslint.config.js` (flat config)
2. ✅ Installed globals package for environment definitions
3. ✅ Added `"type": "module"` to package.json
4. ✅ Renamed config files to `.cjs` (jest, commitlint)
5. ✅ Updated no-unused-vars rule for catch blocks
6. ✅ Fixed unused error variable in logger.js
7. ✅ All 184 tests passing
8. ✅ Pre-commit and pre-push hooks working

**Commit:** a598155
**Time Spent:** ~45 minutes
**Result:** ESLint 9.39.2 active with flat config format
**PR Action:** Closed with explanation (migration completed)

---

### ⚠️ Blocked PRs (Require Manual Work)

#### PR #13: Nock 13 → 14 (BLOCKED)

**Status:** ❌ BLOCKED - Test failures
**Reason:** Breaking changes in HTTP mocking behavior
**Impact:** 3 test failures in network error handling
**Failed Tests:**
- `tests/integration/api/health.test.js` - network errors
- `tests/unit/services/health.test.js` - network errors
- `tests/unit/services/geolocation.test.js` - timeout errors

**Required Work:**
1. Review nock 14.x release notes and breaking changes
2. Update test expectations for error handling
3. Adjust timeout simulation if API changed
4. Verify error propagation works correctly

**Estimated Effort:** 1-2 hours
**Priority:** Medium (dev tooling, affects test suite)
**Release Notes:** https://github.com/nock/nock/releases

**Action:** Create issue for Nock 14 migration, keep PR open for reference

---

## Weekly Review Checklist

Run this checklist weekly (or when Dependabot creates new PRs):

- [ ] Check for new Dependabot PRs: `gh pr list --author "app/dependabot"`
- [ ] Apply labels to new PRs: `automated`, `dependencies`
- [ ] Review PR changes: Check `package.json` and `package-lock.json`
- [ ] Check for major version bumps (potential breaking changes)
- [ ] Test each PR locally (see Step 3 above)
- [ ] Merge passing PRs immediately
- [ ] Document blocked PRs with clear reasons
- [ ] Create issues for PRs requiring manual work
- [ ] Update this document with new patterns/learnings

---

## Best Practices

### DO ✅

- **Test locally before merging** - Don't rely on CI alone
- **Merge production dependencies first** - Security is priority
- **Read changelogs for major versions** - Understand breaking changes
- **Keep blocked PRs open** - They remind us of pending work
- **Document blocking reasons** - Help future maintainers
- **Prioritize security updates** - Even if tests need adjustment
- **Update regularly** - Don't let PRs pile up

### DON'T ❌

- **Auto-merge without testing** - Always verify locally
- **Ignore breaking changes** - They will cause issues later
- **Merge if tests fail** - Fix tests first or create migration issue
- **Close blocked PRs without issues** - Track the work needed
- **Skip changelogs** - Major versions often have important changes
- **Let PRs age** - Stale PRs are harder to merge
- **Mix multiple dependency updates** - One at a time is safer

---

## Automation Opportunities

### Current Manual Steps
1. Check for new PRs
2. Apply labels
3. Test locally
4. Merge or block

### Future Automation Ideas
- **Auto-label:** GitHub Action to apply `automated` label to Dependabot PRs
- **Auto-test:** GitHub Action to run tests on Dependabot PRs
- **Auto-merge:** Auto-merge if tests pass (with caution)
- **Notification:** Slack/email notification for new Dependabot PRs
- **Weekly report:** Summary of dependency update status

---

## Metrics & Tracking

### Current Stats (2026-01-26)

**PRs Processed:** 5
**PRs Merged:** 3 (60%)
**PRs Resolved (Manual):** 1 (20%)
**PRs Blocked:** 1 (20%)
**Testing Time:** ~25 minutes
**Migration Time:** ~45 minutes (ESLint 9)
**Merge Time:** ~2 minutes
**Total Time:** ~72 minutes

**Resolution Methods:**
- Direct merge: 3 (60%)
- Manual migration: 1 (20%)
- Still blocked: 1 (20%)

**Categories:**
- Production dependencies: 1 (20%)
- Dev dependencies: 4 (80%)

---

## Related Documentation

- **Testing Results:** `/DEPENDABOT-PR-TESTING-RESULTS.md`
- **PR Labeling Guide:** `docs/PR-LABELING-GUIDE.md`
- **Workflow Improvements:** `docs/WORKFLOW-IMPROVEMENTS.md`
- **CI/CD Documentation:** `docs/CI-CD-IMPROVEMENTS.md`

---

## Quick Reference

### Useful Commands

```bash
# List all automated PRs
gh pr list --label "automated"

# Test a Dependabot PR
git fetch origin <branch> && git checkout <branch>
npm install && npm test

# Merge a PR
gh pr merge <NUMBER> --merge --delete-branch

# Block a PR with comment
gh pr comment <NUMBER> --body "Blocked: reason here"

# Create migration issue
gh issue create --title "Migration: package to vX" --label "dependencies"
```

### Status Symbols
- ✅ Merged successfully
- ⚠️ Blocked - requires manual work
- 🔒 Security update (prioritize)
- 📦 Production dependency (prioritize)
- 🧪 Dev dependency (lower priority)

---

**Last Review:** 2026-01-26
**Next Review:** 2026-02-02 (weekly)
**Owner:** Development Team
