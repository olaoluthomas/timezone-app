#!/bin/bash
set -e

# ⚠️ PREVENT DIRECT COMMITS TO MAIN
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

# Allow commits to main in CI (for semantic-release automation)
if [ "$CI" != "true" ] && ([ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]); then
  echo ""
  echo "❌ COMMIT BLOCKED: Cannot commit directly to $BRANCH branch!"
  echo ""
  echo "📋 Follow the Issue-First Workflow (SOP):"
  echo "   1. Create a GitHub issue: gh issue create --title \"type: description\" --label \"type\""
  echo "   2. Create a feature branch: git checkout -b type/issue-N-description"
  echo "   3. Make your changes and commit"
  echo "   4. Push and create PR: git push -u origin branch-name"
  echo ""
  echo "💡 Exceptions (no issue required):"
  echo "   - Typo fixes (use chore: prefix)"
  echo "   - Urgent hotfixes (create issue retroactively)"
  echo ""
  echo "📖 See CONTRIBUTING.md for full workflow details"
  echo ""
  exit 1
fi

echo "🎨 Running pre-commit checks..."
echo ""

# Get staged JS and JSON files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|json)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "No JS/JSON files staged, skipping checks"
  exit 0
fi

# Get only JS files for linting (exclude JSON)
STAGED_JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.js$' || true)

echo "📝 Formatting code with Prettier..."
npm run format -- $STAGED_FILES

if [ -n "$STAGED_JS_FILES" ]; then
  echo "🔍 Linting code with ESLint..."
  npm run lint:fix -- $STAGED_JS_FILES
fi

# Re-add formatted files
git add $STAGED_FILES

echo ""
echo "✅ Pre-commit checks passed!"
echo ""
