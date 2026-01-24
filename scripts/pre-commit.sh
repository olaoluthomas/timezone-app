#!/bin/bash
set -e

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
