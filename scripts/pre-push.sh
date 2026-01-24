#!/bin/bash
set -e

echo "🔍 Running pre-push checks..."
echo ""

# Run full CI test suite (already has API mocking)
./run-ci-tests.sh

# If tests pass, get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
REMOTE_BRANCH="origin/$CURRENT_BRANCH"

echo ""
echo "✅ All tests passed!"
echo "📤 Pushing to $REMOTE_BRANCH..."
echo ""

# Note: The actual push happens after this script
# Git will proceed with push if exit code is 0
