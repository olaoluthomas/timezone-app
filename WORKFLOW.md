# Development Workflow Quick Reference

**⚠️ MANDATORY: All code changes MUST follow the issue-first workflow.**

## Standard Workflow (Required)

```bash
# Step 1: Create GitHub Issue (MANDATORY)
gh issue create --title "type: brief description" --label "type"
# Returns: Created issue #N

# Step 2: Create Branch (MUST reference issue number)
git checkout -b type/issue-N-short-description

# Step 3: Make Changes & Commit
git add .
git commit -m "type: description of changes"

# Step 4: Push Branch
git push -u origin type/issue-N-short-description

# Step 5: Create Pull Request (MUST reference issue)
gh pr create --title "type: description (Fixes #N)"
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
refactor: extract constants to config module
chore: update dependencies
```

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
- ✅ **Full Test Suite**: Runs all 213 tests (~15 seconds)
- ✅ **Code Coverage**: Verifies 96%+ coverage maintained
- ✅ **Security Audit**: Checks for vulnerabilities
- ✅ **Build Validation**: Ensures code compiles

**Push will be blocked if any check fails.**

## Quick Examples

### Adding a New Feature

```bash
# 1. Create issue
gh issue create --title "feat: Add timezone converter" --label "enhancement"
# Returns: Created issue #42

# 2. Create branch
git checkout -b feat/issue-42-timezone-converter

# 3. Develop, test, commit
npm test
git commit -m "feat: add timezone converter endpoint"

# 4. Push and create PR
git push -u origin feat/issue-42-timezone-converter
gh pr create --title "feat: add timezone converter (Closes #42)"
```

### Fixing a Bug

```bash
# 1. Create issue
gh issue create --title "fix: Rate limiting broken on localhost" --label "bug"
# Returns: Created issue #14

# 2. Create branch
git checkout -b fix/issue-14-rate-limit-localhost

# 3. Write failing test, fix bug, verify tests pass
npm test

# 4. Commit and push
git commit -m "fix: resolve rate limiting issue for localhost"
git push -u origin fix/issue-14-rate-limit-localhost

# 5. Create PR
gh pr create --title "fix: rate limiting for localhost (Fixes #14)"
```

### Refactoring Code

```bash
# 1. Create issue
gh issue create --title "refactor: Remove unnecessary Promise.resolve wrapper" --label "refactor"
# Returns: Created issue #37

# 2. Create branch
git checkout -b refactor/issue-37-remove-promise-resolve

# 3. Refactor and verify tests still pass
npm test

# 4. Commit and push
git commit -m "refactor: remove unnecessary Promise.resolve() wrapper"
git push -u origin refactor/issue-37-remove-promise-resolve

# 5. Create PR
gh pr create --title "refactor: remove unnecessary Promise.resolve() wrapper (Fixes #37)"
```

## PR Requirements

All PRs **MUST**:
- ✅ Reference issue number in title: `(Closes #N)`, `(Fixes #N)`, or `(Resolves #N)`
- ✅ Include `Closes #N`, `Fixes #N`, or `Resolves #N` in PR description
- ✅ Pass all CI checks (10/10 green)
- ✅ Follow conventional commit format
- ✅ Include tests for new functionality
- ✅ Maintain or improve code coverage (96%+)

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

### ❌ Mistake: PR without issue reference
```bash
gh pr create --title "Add new feature"  # ❌ No issue link
```

**✅ Solution:** Reference the issue
```bash
gh pr create --title "feat: add new feature (Closes #42)"
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
