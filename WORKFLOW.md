# Development Workflow Quick Reference

**⚠️ MANDATORY: All code changes MUST follow the issue-first workflow.**

## Standard Workflow (Required)

```bash
# Step 1: Create GitHub Issue (MANDATORY)
# Preferred: GitHub MCP issue_write (method: create)
# Fallback:  gh issue create --title "type: brief description" --label "type"
# Returns: Created issue #N

# Step 2: Create Branch (MUST reference issue number)
git checkout -b type/issue-N-short-description

# Step 3: Make Changes & Commit
git add .
git commit -m "type: description of changes"

# Step 4: Push Branch
git push -u origin type/issue-N-short-description

# Step 5: Create Pull Request
# Preferred: GitHub MCP create_pull_request (with labels from commit type + changed files)
# Fallback:  npm run create-pr
```

## Branch Naming Convention

All branches **MUST** include the issue number:

```bash
fix/issue-14-rate-limit-localhost       # Bug fixes
feat/issue-42-add-authentication        # New features
refactor/issue-67-extract-constants     # Refactoring
docs/issue-88-update-readme             # Documentation
chore/issue-52-prevent-main-commits     # Maintenance
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add user authentication
fix: resolve CORS issue on localhost
docs: update API documentation
test: add integration tests for health endpoint
test(refactor): extract nock helpers into tests/helpers
refactor(services): extract constants from geolocation service
chore: update dependencies
ci: add security audit step to workflow
build: switch from ts-node to tsx
```

> **Rule 1 — type by directory**: if every changed file is under `tests/`, the type **must** be `test:` — even when the work is structural (e.g. extracting test helpers). `test:` does not trigger a release. `refactor:` does (patch).

> **Rule 2 — split `src/` and `tests/` into separate commits**: when a change touches both `src/` and `tests/`, stage and commit them independently. The `src/` commit uses the appropriate type (`feat:`, `fix:`, `refactor:`, etc.); the `tests/` commit uses `test:`. This keeps the CHANGELOG accurate and ensures `test:` commits (which don't trigger releases) are never bundled with types that do.
>
> ```bash
> # ✅ Correct — two commits
> git add src/controllers/
> git commit -m "refactor(controllers): extract route handlers to controller layer"
> git add tests/unit/controllers/
> git commit -m "test(controllers): add unit tests for healthController and timezoneController"
>
> # ❌ Wrong — one commit mixing src/ and tests/
> git add src/controllers/ tests/unit/controllers/
> git commit -m "refactor(controllers): extract route handlers and add tests"
> ```

## ⛔ What NOT to Do

**❌ DO NOT commit directly to main:**
```bash
# This will be BLOCKED by pre-commit hook
git checkout main
git commit -m "some changes"
# Error: Cannot commit directly to main branch!
```

**❌ DO NOT create PRs without issue references:**
```bash
# Bad PR title
"Update README"

# Good PR title
"docs: update README with API examples (Fixes #88)"
```

**❌ DO NOT mix `src/` and `tests/` in a single commit:**
```bash
# Bad — one commit bundles implementation and tests
git add src/controllers/ tests/unit/controllers/
git commit -m "refactor(controllers): extract route handlers and add tests"

# Good — two commits, each with the right type
git add src/controllers/
git commit -m "refactor(controllers): extract route handlers to controller layer"
git add tests/unit/controllers/
git commit -m "test(controllers): add unit tests for healthController and timezoneController"
```

**❌ DO NOT skip creating issues:**
- Exception: Typo fixes (use `chore:` prefix)
- Exception: Urgent hotfixes (create issue retroactively)

## Automated Git Hooks

### Pre-Commit Hook (Automatic)
- ✅ **Branch Protection**: Blocks commits to main/master
- ✅ **Code Formatting**: Prettier auto-formats staged files
- ✅ **Linting**: ESLint auto-fixes issues
- ✅ **Commit Message**: Validates conventional commit format

### Pre-Push Hook (Automatic)
- ✅ **Full Test Suite**: Runs all 345 tests (~60 seconds)
- ✅ **Code Coverage**: Verifies 96%+ coverage maintained
- ✅ **Security Audit**: Checks for vulnerabilities
- ✅ **Build Validation**: Ensures code compiles

**Push will be blocked if any check fails.**

## Quick Examples

### Adding a New Feature

```bash
# 1. Create issue
# Preferred: GitHub MCP issue_write (method: create, title: "feat: Add timezone converter", labels: ["enhancement"])
# Fallback:  gh issue create --title "feat: Add timezone converter" --label "enhancement"
# Returns: Created issue #42

# 2. Create branch
git checkout -b feat/issue-42-timezone-converter

# 3. Develop, test, commit
npm test
git commit -m "feat: add timezone converter endpoint"

# 4. Push and create PR
git push -u origin feat/issue-42-timezone-converter
# Preferred: GitHub MCP create_pull_request | Fallback: npm run create-pr
```

### Fixing a Bug

```bash
# 1. Create issue
# Preferred: GitHub MCP issue_write (method: create, title: "fix: Rate limiting broken on localhost", labels: ["bug"])
# Fallback:  gh issue create --title "fix: Rate limiting broken on localhost" --label "bug"
# Returns: Created issue #14

# 2. Create branch
git checkout -b fix/issue-14-rate-limit-localhost

# 3. Write failing test, fix bug, verify tests pass
npm test

# 4. Commit and push
git commit -m "fix: resolve rate limiting issue for localhost"
git push -u origin fix/issue-14-rate-limit-localhost

# 5. Create PR
# Preferred: GitHub MCP create_pull_request | Fallback: npm run create-pr
```

### Refactoring Code

```bash
# 1. Create issue
# Preferred: GitHub MCP issue_write (method: create, title: "refactor: Remove unnecessary Promise.resolve wrapper", labels: ["refactor"])
# Fallback:  gh issue create --title "refactor: Remove unnecessary Promise.resolve wrapper" --label "refactor"
# Returns: Created issue #37

# 2. Create branch
git checkout -b refactor/issue-37-remove-promise-resolve

# 3. Refactor and verify tests still pass
npm test

# 4. Commit src/ and tests/ separately
git add src/
git commit -m "refactor: remove unnecessary Promise.resolve() wrapper (Closes #37)"
git add tests/
git commit -m "test: update geolocation tests for Promise.resolve removal"

# 5. Push and create PR
git push -u origin refactor/issue-37-remove-promise-resolve
# Preferred: GitHub MCP create_pull_request | Fallback: npm run create-pr
```

## Creating Pull Requests

**Preferred: GitHub MCP `create_pull_request`** with labels derived from commit type and changed files (see labeling logic in `scripts/create-pr.sh`).

**Fallback: Automated PR creation script**

```bash
npm run create-pr
```

Benefits of the automated script:
- ✅ **Auto-labels**: Applies labels based on commit type and changed files
- ✅ **Consistent format**: Generates standardized PR descriptions
- ✅ **Issue linking**: Automatically links to related issues
- ✅ **Reviewer assignment**: Assigns appropriate reviewers
- ✅ **Validation**: Ensures PR follows project conventions

### How Labels Are Applied

The script automatically labels PRs based on:

**Commit Type → Type Labels:**
- `feat:` → "enhancement"
- `fix:` → "bug"
- `docs:` → "documentation"
- `test:` → "tests"
- `refactor:` → "refactor"

**Changed Files → Area Labels:**
- `src/**/*.js` → "code"
- `tests/` → "tests"
- `docs/` or `.md` files or `.env.example` → "documentation"
- `package.json` → "dependencies"
- `src/middleware/` → "middleware"
- `src/services/` → "services"

## PR Requirements

All PRs **MUST**:
- ✅ Be created using GitHub MCP `create_pull_request` (preferred) or `npm run create-pr` (fallback)
- ✅ Reference issue number in commit messages and PR
- ✅ Pass all CI checks (10/10 green)
- ✅ Follow conventional commit format
- ✅ Include tests for new functionality
- ✅ Maintain or improve code coverage (96%+)
- ✅ Have appropriate labels applied (automatic via script)

### Merge Method by PR Direction

> ⚠️ **The merge method is critical for correct CHANGELOG generation.**

| PR direction | Required method | Forbidden |
|---|---|---|
| feature / fix / docs → `dev` | **Squash and merge** | — |
| `dev` → `main` | **Create a merge commit** | ❌ Squash, ❌ Rebase |

Squash-merging `dev` into `main` collapses all commits into one — semantic-release sees a single commit and produces one CHANGELOG line instead of individual entries per feature/fix.

## Common Mistakes

### ❌ Mistake: Committing to main
```bash
git checkout main
git commit -m "quick fix"
# ❌ BLOCKED: Cannot commit directly to main!
```

**✅ Solution:** Create a branch
```bash
git checkout -b fix/issue-N-description
git commit -m "fix: description"
```

### ❌ Mistake: Branch without issue reference
```bash
git checkout -b add-feature  # ❌ No issue number
```

**✅ Solution:** Include issue number
```bash
git checkout -b feat/issue-42-add-feature
```

### ❌ Mistake: Manual PR creation without labels
```bash
gh pr create --title "feat: add new feature (Closes #42)"  # ❌ No labels applied
```

**✅ Solution:** Use GitHub MCP or the automated script
```
# Preferred: GitHub MCP create_pull_request with labels
# Fallback:  npm run create-pr (auto-applies labels)
```

## Why This Workflow?

- ✅ **Tracking**: Every change is linked to an issue
- ✅ **Context**: Future developers understand why changes were made
- ✅ **Searchability**: Easy to find related discussions and decisions
- ✅ **Automation**: Issues auto-close when PRs merge
- ✅ **Quality**: Hooks enforce standards before code reaches main
- ✅ **Collaboration**: Clear process for all contributors

## Need Help?

- 📖 **Full Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- 💬 **Questions**: Create an issue with `question` label
- 🐛 **Bug Reports**: Create an issue with `bug` label
- ✨ **Feature Requests**: Create an issue with `enhancement` label

## Quick Links

- [CONTRIBUTING.md](CONTRIBUTING.md) - Full contribution guide
- [CLAUDE.md](CLAUDE.md) - Project overview and SOP
- [README.md](README.md) - Project documentation
- [GitHub Issues](https://github.com/olaoluthomas/timezone-app/issues) - Issue tracker

---

**Last Updated:** 2026-02-07
**Status:** Production workflow with technical safeguards
