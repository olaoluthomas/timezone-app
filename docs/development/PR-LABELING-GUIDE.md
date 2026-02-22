# Pull Request Labeling Guide

**Project:** Timezone Web App
**Last Updated:** 2026-01-26
**Purpose:** Standardize PR labeling for better tracking and organization

---

## Overview

This guide defines the standard operating procedure for applying labels to Pull Requests. Labels help with:
- Quick identification of PR type and scope
- Filtering and searching PRs
- Generating release notes
- Understanding codebase changes over time

---

## Label Categories

### 1. Type Labels (Primary Classification)

**One type label per PR** - describes the primary purpose

| Label | Description | When to Use | Commit Prefix |
|-------|-------------|-------------|---------------|
| `enhancement` | New features or functionality | Adding new capabilities | `feat:` |
| `bug` | Bug fixes | Fixing broken functionality | `fix:` |
| `documentation` | Documentation only | README, docs/, comments | `docs:` |
| `refactor` | Code refactoring | Improving code structure without changing behavior | `refactor:` |
| `tests` | Test-related changes | Adding or updating tests | `test:` |

**Examples:**
- `feat: add user authentication` → `enhancement`
- `fix: correct timezone offset calculation` → `bug`
- `docs: update API documentation` → `documentation`
- `refactor: extract validation logic` → `refactor`
- `test: add integration tests for cache` → `tests`

---

### 2. Area Labels (Secondary Classification)

**Multiple area labels allowed** - describes what parts of the codebase are affected

| Label | Description | When to Use |
|-------|-------------|-------------|
| `code` | Source code changes | Changes to `src/**/*.js` files |
| `tests` | Test changes | Changes to `tests/` directory |
| `documentation` | Documentation changes | Changes to `docs/`, `*.md` files |
| `dependencies` | Dependency updates | Changes to `package.json`, `package-lock.json` |
| `middleware` | Middleware changes | Changes to `src/middleware/` |
| `services` | Service layer changes | Changes to `src/services/` |

**Examples:**
- PR changing `src/services/cache.js` → `code`, `services`
- PR adding tests for middleware → `tests`, `middleware`
- PR updating docs and adding tests → `documentation`, `tests`

---

### 3. Special Labels (Optional)

| Label | Description | When to Use |
|-------|-------------|-------------|
| `help wanted` | Need assistance | Complex PRs needing extra review |
| `good first issue` | Beginner-friendly | Simple PRs good for new contributors |
| `question` | Clarification needed | PR with open questions or discussion |
| `duplicate` | Duplicate work | Duplicate of another PR |
| `invalid` | Invalid changes | Incorrect or unwanted changes |
| `wontfix` | Won't be implemented | Rejected PRs |

---

## Automated Labeling

The `scripts/create-pr.sh` script **automatically applies labels** based on:

### 1. Commit Message Analysis

Conventional Commits format is parsed:
- `feat:` → `enhancement`
- `fix:` → `bug`
- `docs:` → `documentation`
- `refactor:` → `refactor`
- `test:` → `tests`

### 2. File Path Analysis

Changed files are analyzed:
- `src/**/*.js` → `code`
- `tests/**` → `tests`
- `docs/**`, `*.md` → `documentation`
- `package.json` → `dependencies`
- `src/middleware/**` → `middleware`
- `src/services/**` → `services`

### Example:

```bash
# Commit message: "refactor: extract constants to config"
# Changed files:
#   - src/config/constants.js
#   - src/services/cache.js
#   - tests/unit/config/constants.test.js

# Automatic labels applied:
#   - refactor (from commit)
#   - code (from src/)
#   - services (from src/services/)
#   - tests (from tests/)
```

---

## Manual Label Updates

For PRs created outside the automation or needing corrections:

### Using GitHub MCP (Preferred)

```
# Add/update labels
update_pull_request (owner, repo, pullNumber, labels: ["label1", "label2"])
# Or for issues:
issue_write (method: update, labels: ["label1", "label2"])
```

### Using GitHub CLI (Fallback)

```bash
# Add labels
gh pr edit <PR_NUMBER> --add-label "label1,label2,label3"

# Remove labels
gh pr edit <PR_NUMBER> --remove-label "label1"
```

### Using GitHub Web UI

1. Go to the PR page
2. Click the "Labels" gear icon in the right sidebar
3. Select/deselect labels
4. Click outside to save

---

## Label Decision Tree

Use this flowchart to determine labels:

```
1. What type of change?
   ├─ New feature → enhancement
   ├─ Bug fix → bug
   ├─ Code improvement → refactor
   ├─ Documentation → documentation
   └─ Tests → tests

2. What areas changed?
   ├─ Source code (src/) → code
   ├─ Tests (tests/) → tests
   ├─ Documentation (docs/) → documentation
   ├─ Dependencies (package.json) → dependencies
   ├─ Middleware (src/middleware/) → middleware
   └─ Services (src/services/) → services

3. Special circumstances?
   ├─ Need help → help wanted
   ├─ Beginner friendly → good first issue
   ├─ Has questions → question
   └─ None → done
```

---

## Common Labeling Scenarios

### Scenario 1: New Feature with Tests
**PR:** Adds new `/api/health/ready` endpoint with tests

**Labels:**
- `enhancement` (new feature)
- `code` (changes src/)
- `tests` (includes tests)
- `services` (if modifies services)

### Scenario 2: Bug Fix
**PR:** Fixes cache expiration bug

**Labels:**
- `bug` (bug fix)
- `code` (changes src/)
- `services` (modifies cache service)

### Scenario 3: Documentation Update
**PR:** Updates README and adds new doc files

**Labels:**
- `documentation` (primary purpose)

### Scenario 4: Refactoring with Tests
**PR:** Extracts constants, updates services, adds tests

**Labels:**
- `refactor` (code improvement)
- `code` (changes src/)
- `tests` (adds tests)
- `services` (modifies services)

### Scenario 5: Dependency Update
**PR:** Updates npm packages

**Labels:**
- `dependencies` (primary purpose)

---

## Best Practices

### DO ✅

- Apply labels immediately when creating PRs
- Use automation (`npm run create-pr`) for consistent labeling
- Add multiple area labels when appropriate
- Update labels if PR scope changes
- Use descriptive commit messages for accurate auto-labeling

### DON'T ❌

- Skip labels (all PRs should have at least one label)
- Use multiple type labels (pick the primary purpose)
- Ignore automated labels without reason
- Leave outdated labels after PR changes
- Use `wontfix` or `invalid` without explanation

---

## Label Statistics & Review

### Tracking Label Usage

```
# Preferred: GitHub MCP search_pull_requests or list_pull_requests
# Fallback:
gh pr list --label "refactor"
gh pr list --label "enhancement" --limit 10
```

### Monthly Review Checklist

- [ ] Review label usage patterns
- [ ] Identify mislabeled PRs
- [ ] Update label descriptions if needed
- [ ] Archive obsolete labels
- [ ] Update this guide with new patterns

---

## Label Reference

### Current Available Labels

```
# Preferred: GitHub MCP get_label or list labels via API
# Fallback:  gh label list
```

**Standard Labels:**
- `bug` (#d73a4a - red)
- `documentation` (#0075ca - blue)
- `enhancement` (#a2eeef - light blue)
- `tests` (#BFD4F2 - light blue)
- `code` (#D4C5F9 - light purple)
- `refactor` (#FBCA04 - yellow)
- `middleware` (#C2E0C6 - light green)
- `services` (#FEF2C0 - light yellow)
- `dependencies` (#0366D6 - dark blue)

**Special Labels:**
- `help wanted` (#008672 - teal)
- `good first issue` (#7057ff - purple)
- `question` (#d876e3 - pink)
- `duplicate` (#cfd3d7 - gray)
- `invalid` (#e4e669 - yellow)
- `wontfix` (#ffffff - white)

---

## Integration with Workflows

### Pre-Push Workflow

The `scripts/create-pr.sh` script is automatically triggered by:

```bash
# Automatic PR creation
npm run create-pr

# Manual PR creation (with automation)
git push -u origin feature-branch
npm run create-pr
```

### GitHub Actions

Future integration (planned):
- Auto-label based on file changes
- Validate labels before merge
- Generate release notes from labels

---

## Examples from Recent PRs

### PR #8: Documentation Overhaul

**Title:** `docs: update refactoring status and comprehensive documentation overhaul`

**Labels Applied:**
- `documentation` (primary - 10 new doc files)
- `refactor` (extracted constants)
- `code` (src/ changes)
- `tests` (new tests added)

**Reasoning:**
- Primary purpose is documentation (10 new doc files)
- Includes code refactoring (constants extraction)
- Adds source code changes (src/config/constants.js)
- Includes comprehensive new tests

---

## Updating This Guide

### When to Update

- New label added to repository
- New automation logic added to `create-pr.sh`
- Common labeling patterns identified
- Label usage changes significantly

### How to Update

1. Edit `docs/PR-LABELING-GUIDE.md`
2. Update examples and decision tree
3. Test automation with `scripts/create-pr.sh`
4. Commit with: `docs: update PR labeling guide`
5. Apply labels: `documentation`

---

## Related Documentation

- **Workflow Improvements:** `docs/WORKFLOW-IMPROVEMENTS.md`
- **PR Creation Script:** `scripts/create-pr.sh`
- **Commit Message Guide:** `commitlint.config.js`
- **CI/CD Documentation:** `docs/CI-CD-IMPROVEMENTS.md`

---

## Quick Reference

### Create PR with Auto-Labels

```
# Preferred: GitHub MCP create_pull_request (with labels)
# Fallback:  npm run create-pr
```

### Manually Add Labels

```
# Preferred: GitHub MCP update_pull_request (labels)
# Fallback:  gh pr edit <NUMBER> --add-label "label1,label2"
```

### List PRs by Label

```
# Preferred: GitHub MCP search_pull_requests (query: "label:refactor")
# Fallback:  gh pr list --label "refactor"
```

### View PR Labels

```
# Preferred: GitHub MCP pull_request_read (method: get)
# Fallback:  gh pr view <NUMBER> --json labels
```

---

**Last Review:** 2026-02-22
**Next Review:** 2026-02-26
**Owner:** Development Team
