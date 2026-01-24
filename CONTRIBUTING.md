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
<type>: <short description>

Examples:
feat: add timezone converter endpoint
fix: resolve cache key collision issue
docs: improve API documentation
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

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

## Common Contribution Scenarios

### Adding a New Feature

1. Create an issue describing the feature
2. Wait for maintainer feedback
3. Create a feature branch
4. Write tests first (TDD)
5. Implement the feature
6. Update documentation
7. Submit PR

### Fixing a Bug

1. Create an issue (if none exists)
2. Create a bugfix branch
3. Write a failing test that reproduces the bug
4. Fix the bug
5. Ensure test passes
6. Submit PR

### Updating Documentation

1. Create a docs branch
2. Make your changes
3. Verify formatting and links
4. Submit PR

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
