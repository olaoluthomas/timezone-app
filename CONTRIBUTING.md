# Contributing to Timezone App

Thank you for your interest in contributing to the Timezone App! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [AI-Assisted Development](#ai-assisted-development)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Spam or promotional content
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

- **Node.js**: 18.x or 20.x
- **npm**: 8.x or higher
- **Git**: Latest version
- **Text Editor**: VS Code recommended

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/timezone-app.git
   cd timezone-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Verify setup**
   ```bash
   npm test           # All tests should pass
   npm run lint       # No errors
   npm run format     # Code formatted
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Before Starting Work

- Check existing issues for similar work
- Comment on the issue you're working on
- Discuss your approach if it's a major change
- Ensure your fork is up to date

### 2. During Development

```bash
# Run tests in watch mode
npm run test:watch

# Check code quality frequently
npm run lint
npm run format

# Test your changes
npm test
```

### 3. Before Committing

Run the full CI test suite locally:

```bash
./run-ci-tests.sh
```

This ensures your changes will pass CI checks.

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add timezone converter functionality"
git commit -m "fix: handle edge case in IP normalization"
git commit -m "docs: update API documentation"
git commit -m "test: add integration tests for health endpoint"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Formatting changes
- `chore`: Build/config changes

### 5. Automated Git Workflow

This project uses automated git hooks to maintain code quality:

#### Pre-Commit Hook (Automatic)
When you commit, the pre-commit hook automatically:
1. **Formats** your code with Prettier
2. **Lints** your code with ESLint (auto-fixes issues)
3. **Re-stages** formatted files

```bash
git commit -m "feat: add new feature"

# Output:
🎨 Running pre-commit checks...
📝 Formatting code with Prettier... ✓
🔍 Linting code with ESLint... ✓
✅ Pre-commit checks passed!
```

#### Commit Message Validation (Automatic)
Invalid commit messages are rejected:

```bash
git commit -m "added stuff"
❌ Commit message doesn't follow conventional format
```

#### Pre-Push Hook (Automatic)
When you push, the pre-push hook automatically runs:
1. **Full test suite** (133 tests)
2. **Code coverage** verification (98.9%)
3. **Linting** checks
4. **Security audit**

**The push is blocked if any check fails** (~15 seconds total).

```bash
git push origin feature/my-feature

# Output:
🔍 Running pre-push checks...
✅ All tests passed! (133/133)
📤 Pushing to origin/feature/my-feature...
```

#### Creating Pull Requests
After pushing, create a PR using:

```bash
npm run create-pr
# Creates PR with auto-applied labels based on changes
```

**Do not bypass the hooks** - they exist to maintain code quality.

## Code Standards

### JavaScript Style

- **Linting**: ESLint (eslint:recommended)
- **Formatting**: Prettier (2-space indentation, single quotes)
- **Naming**: camelCase for variables/functions, PascalCase for classes

### Code Quality Rules

1. **No console.log in production code**
   - Use structured logging (winston)
   - Exception: Temporary debugging (remove before PR)

2. **All functions must have JSDoc comments**
   ```javascript
   /**
    * Fetches timezone information for the given IP
    * @param {string} ip - IP address to lookup
    * @returns {Promise<Object>} Timezone and location data
    */
   async function getTimezoneByIP(ip) {
     // Implementation
   }
   ```

3. **Error handling is mandatory**
   ```javascript
   try {
     const data = await apiCall();
     return data;
   } catch (error) {
     logger.error('API call failed', { error: error.message });
     throw new Error('Failed to fetch data');
   }
   ```

4. **Keep functions small and focused**
   - Single responsibility principle
   - Max 50 lines per function
   - Extract complex logic to separate functions

5. **Use meaningful variable names**
   ```javascript
   // Good
   const cachedTimezoneData = cache.get(cacheKey);

   // Bad
   const data = cache.get(key);
   ```

## Testing Requirements

### Coverage Requirements

- **Overall**: ≥80% line coverage
- **Functions**: ≥75% function coverage
- **Branches**: ≥70% branch coverage

### Test Categories

1. **Unit Tests** (required for all new code)
   ```javascript
   // tests/unit/services/my-service.test.js
   describe('MyService', () => {
     it('should handle valid input', () => {
       const result = myService.process('valid');
       expect(result).toBe('expected');
     });

     it('should throw error for invalid input', () => {
       expect(() => myService.process(null)).toThrow();
     });
   });
   ```

2. **Integration Tests** (for API endpoints)
   ```javascript
   // tests/integration/api/my-endpoint.test.js
   describe('GET /api/my-endpoint', () => {
     it('should return 200 with valid data', async () => {
       const response = await request(app).get('/api/my-endpoint');
       expect(response.status).toBe(200);
       expect(response.body).toHaveProperty('data');
     });
   });
   ```

3. **Smoke Tests** (for critical paths)
   ```javascript
   // tests/smoke/critical-path.test.js
   describe('Critical Path Smoke Tests', () => {
     it('should handle end-to-end flow', async () => {
       // Test critical user journey
     });
   });
   ```

### Running Tests

```bash
npm test                    # All tests with coverage
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:smoke          # Smoke tests only
npm run test:watch          # Watch mode
```

### Test Best Practices

- Test behavior, not implementation
- Use descriptive test names
- One assertion per test (when possible)
- Mock external dependencies
- Clean up after tests (close connections, clear cache)

## Pull Request Process

### 1. Prepare Your PR

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] CI tests pass locally (`./run-ci-tests.sh`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)

### 2. Create Pull Request

**Title Format:**
```
<type>: <short description> (<Closes|Fixes|Resolves> #issue-number)

Examples:
feat: add timezone converter endpoint (Closes #42)
fix: resolve cache key collision issue (Fixes #14)
docs: improve API documentation (Closes #88)
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Related Issue
Closes #123
<!-- Use one of: Closes #N, Fixes #N, or Resolves #N -->
<!-- This auto-closes the issue when PR is merged -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] CI checks pass
- [ ] Issue number referenced in PR title and description
```

**For PRs without a pre-existing issue** (exceptions only):
```markdown
## No Pre-existing Issue
This PR addresses [describe the issue] which was discovered during [context].
An issue was not created beforehand because: [valid reason - typo fix, urgent hotfix, etc.]
```

### 3. Review Process

- Maintainers will review within 2-3 business days
- Address review feedback promptly
- Keep discussion professional and constructive
- Be patient and respectful

### 4. Merge Criteria

Pull requests will be merged when:
- All CI checks pass
- At least one maintainer approval
- No unresolved review comments
- Branch is up to date with main
- Code coverage maintained or improved

### 5. Merging Pull Requests

**For Maintainers:** This section provides step-by-step instructions for merging PRs.

#### Pre-Merge Checklist

Before merging any PR, verify:

```bash
# Check PR status and CI checks
gh pr view <PR-NUMBER> --json state,mergeable,statusCheckRollup,reviews

# Expected output:
# - state: "OPEN"
# - mergeable: "MERGEABLE"
# - All CI checks: conclusion: "SUCCESS"
# - At least one review approval (if required)
```

**Merge Criteria:**
- ✅ All CI checks passing (10/10 checks green)
- ✅ Code review approval (if team project)
- ✅ No unresolved review comments
- ✅ Branch up to date with main
- ✅ Code coverage maintained (96%+)

#### Merge Methods

This project uses **squash merging** for all PRs to maintain a clean git history.

**Squash Merge (Default):**
```bash
gh pr merge <PR-NUMBER> --squash --delete-branch
```

**Benefits:**
- Clean, linear git history
- Single commit per feature/fix
- Easier to revert if needed
- Removes clutter from multiple work-in-progress commits

**When to use other methods:**
- **Standard Merge:** Never (creates merge commits, clutters history)
- **Rebase Merge:** Never (loses PR context, complicates tracking)

#### Single PR Merge

**Step-by-step process:**

1. **Verify PR is ready to merge:**
   ```bash
   gh pr view <PR-NUMBER> --json state,mergeable,statusCheckRollup | jq '{state, mergeable, ci_passing: [.statusCheckRollup[] | select(.conclusion != "SUCCESS")] | length == 0}'
   ```

2. **Merge the PR with squash:**
   ```bash
   gh pr merge <PR-NUMBER> --squash --delete-branch --subject "type: description (Fixes #N)"
   ```
   - `--squash`: Squashes all commits into one
   - `--delete-branch`: Auto-deletes the branch after merge
   - `--subject`: Sets the commit message (follows conventional commits)

3. **Verify merge succeeded:**
   ```bash
   gh pr view <PR-NUMBER> --json state,mergedAt,mergedBy
   # Expected: state: "MERGED"
   ```

4. **Verify issue auto-closed:**
   ```bash
   gh issue view <ISSUE-NUMBER> --json state,closedAt
   # Expected: state: "CLOSED"
   ```

5. **Update local main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

**Example:**
```bash
# Merge PR #44
gh pr merge 44 --squash --delete-branch --subject "docs: add refactoring analysis (Fixes #43)"

# Verify
gh pr view 44 --json state
gh issue view 43 --json state

# Update local
git checkout main && git pull origin main
```

#### Back-to-Back PR Merges

When merging multiple PRs sequentially (e.g., related documentation updates), follow this workflow to avoid merge conflicts:

**Critical Rule:** Always update your local `main` branch between merges.

**Step-by-step process:**

1. **Merge first PR (PR A):**
   ```bash
   gh pr merge <PR-A-NUMBER> --squash --delete-branch --subject "type: description (Fixes #N)"
   ```

2. **Update local main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```
   ⚠️ **CRITICAL:** Do not skip this step! The second PR may depend on changes from the first.

3. **Verify first PR merged and issue closed:**
   ```bash
   gh pr view <PR-A-NUMBER> --json state,mergedAt
   gh issue view <ISSUE-A-NUMBER> --json state,closedAt
   ```

4. **Check if second PR needs rebase:**
   ```bash
   gh pr view <PR-B-NUMBER> --json mergeable
   ```
   - If `mergeable: "MERGEABLE"` → proceed to step 5
   - If `mergeable: "CONFLICTING"` → rebase required (see below)

5. **Merge second PR (PR B):**
   ```bash
   gh pr merge <PR-B-NUMBER> --squash --delete-branch --subject "type: description (Fixes #M)"
   ```

6. **Update local main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

7. **Verify both PRs merged successfully:**
   ```bash
   gh pr list --state merged --limit 5
   gh issue list --state closed --limit 5
   ```

**Example: Merging PRs #46 and #44**
```bash
# 1. Merge PR #46 (container documentation)
gh pr merge 46 --squash --delete-branch --subject "docs: document container security scanning (Fixes #45)"

# 2. Update local main (REQUIRED)
git checkout main && git pull origin main

# 3. Verify PR #46 and issue #45
gh pr view 46 --json state   # Expected: "MERGED"
gh issue view 45 --json state # Expected: "CLOSED"

# 4. Check PR #44 mergeable status
gh pr view 44 --json mergeable # Expected: "MERGEABLE"

# 5. Merge PR #44 (refactoring documentation)
gh pr merge 44 --squash --delete-branch --subject "docs: add refactoring analysis (Fixes #43)"

# 6. Update local main
git checkout main && git pull origin main

# 7. Verify final state
gh pr list --state merged --limit 2
gh issue list --state closed --limit 2
```

**Why update main between merges?**
- The second PR may have merge conflicts with changes from the first PR
- GitHub needs to re-evaluate the second PR's mergeable status
- Ensures you have the latest code when reviewing subsequent PRs
- Prevents "branch out of date" errors

#### Handling Merge Conflicts

If a PR has merge conflicts:

1. **Update PR branch with latest main:**
   ```bash
   git checkout <pr-branch-name>
   git pull origin <pr-branch-name>
   git fetch origin main
   git merge origin/main
   ```

2. **Resolve conflicts:**
   ```bash
   # Edit conflicting files
   git add <resolved-files>
   git commit -m "chore: resolve merge conflicts with main"
   ```

3. **Push updated branch:**
   ```bash
   git push origin <pr-branch-name>
   ```

4. **Wait for CI to pass, then merge:**
   ```bash
   gh pr merge <PR-NUMBER> --squash --delete-branch
   ```

#### Post-Merge Verification

After merging one or more PRs:

```bash
# 1. Verify git history is clean
git log --oneline -5

# 2. Verify CI is passing on main
gh run list --branch main --limit 3

# 3. Verify issues were auto-closed
gh issue list --state closed --limit 5

# 4. Verify branches were deleted
gh pr list --state merged --limit 5 --json number,headRefName
```

#### Common Merge Scenarios

**Scenario 1: Single documentation PR**
```bash
gh pr merge 44 --squash --delete-branch --subject "docs: update README (Fixes #43)"
git checkout main && git pull origin main
```

**Scenario 2: Two related PRs (container docs #46, refactoring docs #44)**
```bash
# First PR
gh pr merge 46 --squash --delete-branch
git checkout main && git pull origin main

# Second PR (after main updated)
gh pr merge 44 --squash --delete-branch
git checkout main && git pull origin main
```

**Scenario 3: Feature PR + Documentation PR**
```bash
# Feature PR (may affect tests)
gh pr merge 42 --squash --delete-branch
git checkout main && git pull origin main

# Docs PR (documents the feature)
gh pr merge 43 --squash --delete-branch
git checkout main && git pull origin main
```

#### Rollback a Merged PR

If a PR needs to be rolled back:

```bash
# 1. Find the merge commit
git log --oneline --grep="Fixes #<ISSUE-NUMBER>" -1

# 2. Revert the commit
git revert <commit-sha>

# 3. Push revert commit
git push origin main

# 4. Reopen the issue
gh issue reopen <ISSUE-NUMBER>
```

#### Best Practices

1. **Always squash merge** - Keeps history clean
2. **Update main between merges** - Prevents conflicts
3. **Delete branches after merge** - Reduces clutter
4. **Use conventional commit messages** - Enables automated changelogs
5. **Verify CI passes on main** - Catch integration issues early
6. **Check dependent PRs** - Some PRs may depend on others

## AI-Assisted Development

This project was built using Claude Code and welcomes AI-assisted contributions.

### Using Claude Code

If you're using Claude Code for contributions:

1. **Read project context**
   ```bash
   claude-code --read docs/DEVELOPMENT_TOOLS.md
   claude-code --read CLAUDE.md
   ```

2. **Follow the established patterns**
   - Use local models for implementation
   - Use API models for architecture
   - Follow the documented workflows

3. **Maintain quality standards**
   - AI-generated code must pass all tests
   - Add proper documentation
   - Follow existing code patterns

4. **Disclose AI usage** (optional but appreciated)
   ```markdown
   ## Development Notes
   This PR was developed with assistance from Claude Code.
   ```

### Best Practices for AI-Assisted PRs

- Review all AI-generated code carefully
- Ensure tests are meaningful (not just passing)
- Verify security implications
- Check for code duplication
- Validate error handling

## Project Structure

```
timezone/
├── src/                    # Source code
│   ├── app.js             # Express app
│   ├── index.js           # Entry point
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── public/            # Static files
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── smoke/            # Smoke tests
├── docs/                  # Documentation
│   ├── DEVELOPMENT.md    # Development guide
│   ├── DEVELOPMENT_TOOLS.md  # AI tools guide
│   ├── MILESTONES.md     # Progress tracker
│   └── CI-TESTING.md     # CI guide
└── scripts/               # Utility scripts
```

## Issue-First Workflow (Mandatory)

**⚠️ IMPORTANT: All code changes MUST have an associated GitHub issue.**

Before starting work on bug fixes, features, or enhancements, you **must** create a GitHub issue. This ensures:
- Proper tracking and searchability
- Discussion before implementation
- Clear context for future developers
- Automated PR/issue linking

### Branch Naming Convention

All branches must reference their issue number:

```bash
fix/issue-16-short-description       # Bug fixes
feat/issue-42-add-authentication     # New features
refactor/issue-67-extract-constants  # Refactoring
docs/issue-88-update-readme          # Documentation
```

**Benefits:**
- GitHub auto-links branches to issues
- Easy to identify what a branch addresses
- Clear PR context at a glance

### Exceptions

Issue creation is **optional** for:
- Typo fixes or formatting (use `chore:` prefix)
- Trivial whitespace/comment changes
- Urgent production hotfixes (create issue retroactively)

### Labeling Issues and Pull Requests

**⚠️ IMPORTANT: All issues and PRs MUST be labeled appropriately.**

Labels help organize work, track progress, and make the project searchable. Apply labels when creating issues and PRs.

#### Standard Labels

**Type Labels (Required - Choose One):**
- `bug` - Something isn't working correctly
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `ci-cd` - CI/CD pipeline changes
- `dependencies` - Dependency updates (usually Dependabot)

**Priority Labels (Optional):**
- `priority: high` - Critical issues requiring immediate attention
- `priority: medium` - Important but not urgent
- `priority: low` - Nice to have, can wait

**Status Labels (Optional):**
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - Will not be worked on
- `duplicate` - Duplicate of another issue

**Area Labels (Optional):**
- `infrastructure` - Infrastructure and deployment
- `security` - Security-related issues
- `performance` - Performance improvements
- `testing` - Test-related changes

#### How to Apply Labels

**When Creating an Issue:**
```bash
# Via GitHub CLI
gh issue create --title "feat: Add timezone converter" --label "enhancement"
gh issue create --title "fix: CORS error on localhost" --label "bug"
gh issue create --title "ci: Optimize workflow" --label "ci-cd,enhancement"

# Via GitHub UI
# Select labels from the right sidebar when creating the issue
```

**When Creating a Pull Request:**
```bash
# Via GitHub CLI (after creating PR)
gh pr edit <PR-NUMBER> --add-label "enhancement,documentation"

# Via GitHub UI
# Select labels from the right sidebar after creating the PR
```

**Labeling Rules:**
- **Issues**: Apply appropriate type label when creating (bug, enhancement, etc.)
- **PRs**: Apply same labels as the linked issue for consistency
- **Multiple labels**: Use commas without spaces: `"ci-cd,enhancement"`
- **Keep updated**: Update labels if issue/PR scope changes

**Examples:**
```bash
# Bug fix
gh issue create --title "fix: Rate limiting broken" --label "bug"
gh pr edit 42 --add-label "bug"

# New feature
gh issue create --title "feat: Add dark mode" --label "enhancement"
gh pr edit 43 --add-label "enhancement"

# CI/CD improvement
gh issue create --title "ci: Add caching" --label "ci-cd,enhancement"
gh pr edit 44 --add-label "ci-cd,enhancement"

# Documentation update
gh issue create --title "docs: Update README" --label "documentation"
gh pr edit 45 --add-label "documentation"

# Infrastructure change
gh issue create --title "feat: Kubernetes manifests" --label "enhancement,infrastructure"
gh pr edit 46 --add-label "enhancement,infrastructure"
```

**Benefits of Proper Labeling:**
- ✅ Easy filtering and searching
- ✅ Quick identification of issue type
- ✅ Better project organization
- ✅ Useful for generating changelogs
- ✅ Helps prioritize work

## Common Contribution Scenarios

### Adding a New Feature

1. **Create a GitHub issue** describing the feature (mandatory)
2. Wait for maintainer feedback on approach
3. Create a feature branch: `feat/issue-N-short-description`
4. Write tests first (TDD)
5. Implement the feature
6. Update documentation
7. Submit PR with "Closes #N" in description

**Example:**
```bash
# 1. Create issue via GitHub UI or CLI
gh issue create --title "feat: Add timezone converter" --label "enhancement"
# Returns: Created issue #42

# 2. Create branch
git checkout -b feat/issue-42-timezone-converter

# 3. Make changes, commit, push

# 4. Create PR that references the issue
gh pr create --title "feat: Add timezone converter (Closes #42)"
```

### Fixing a Bug

1. **Create a GitHub issue** describing the bug (mandatory)
   - Include: steps to reproduce, expected vs actual behavior, environment
2. Wait for maintainer acknowledgment (if not urgent)
3. Create a bugfix branch: `fix/issue-N-short-description`
4. Write a failing test that reproduces the bug
5. Fix the bug
6. Ensure test passes
7. Submit PR with "Fixes #N" in description

**Example:**
```bash
# 1. Create issue
gh issue create --title "fix: Rate limiting not working for localhost" --label "bug"
# Returns: Created issue #14

# 2. Create branch
git checkout -b fix/issue-14-rate-limiting-localhost

# 3. Write failing test, fix bug, commit

# 4. Create PR
gh pr create --title "fix: Rate limiting for localhost (Fixes #14)"
```

### Updating Documentation

**For significant documentation updates** (new guides, major rewrites):
1. **Create a GitHub issue** describing the documentation need
2. Create a docs branch: `docs/issue-N-short-description`
3. Make your changes
4. Verify formatting and links
5. Submit PR with "Closes #N" in description

**For minor updates** (typos, formatting, broken links):
1. Create a branch: `chore/fix-typo-in-readme`
2. Make your changes
3. Submit PR (no issue required)

### Improving Tests

1. Identify gaps in coverage
2. Write additional tests
3. Ensure they pass
4. Submit PR

## Getting Help

### Resources

- **Development Guide**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **AI Tools Guide**: [docs/DEVELOPMENT_TOOLS.md](docs/DEVELOPMENT_TOOLS.md)
- **CI Testing Guide**: [docs/CI-TESTING.md](docs/CI-TESTING.md)
- **Project README**: [README.md](README.md)

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Pull Requests**: Code contributions, reviews

### Common Issues

**Tests failing locally?**
```bash
rm -rf node_modules coverage
npm install
npm test
```

**Linting errors?**
```bash
npm run lint:fix
npm run format
```

**CI tests failing?**
```bash
./run-ci-tests.sh
```

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README (for significant contributions)
- Release notes (for features/fixes)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Review existing issues and pull requests

## Thank You!

Your contributions help make this project better for everyone. Thank you for taking the time to contribute!

---

**Last Updated:** 2026-01-24
