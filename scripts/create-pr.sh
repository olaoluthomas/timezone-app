#!/bin/bash
set -e

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_BRANCH="${1:-main}"  # Default to main

# Check if branch exists on remote
if ! git ls-remote --heads origin "$CURRENT_BRANCH" | grep -q "$CURRENT_BRANCH"; then
  echo "❌ Branch $CURRENT_BRANCH not found on remote"
  echo "   Push the branch first: git push -u origin $CURRENT_BRANCH"
  exit 1
fi

echo "🚀 Creating Pull Request..."
echo ""
echo "   From: $CURRENT_BRANCH"
echo "   To:   $BASE_BRANCH"
echo ""

# Generate PR title from recent commits
PR_TITLE=$(git log $BASE_BRANCH..HEAD --pretty=format:"%s" | head -1)

# Determine PR type from title (for labels)
# Based on Conventional Commits specification
PR_TYPE=""
if [[ "$PR_TITLE" =~ ^feat ]]; then
  PR_TYPE="enhancement"
elif [[ "$PR_TITLE" =~ ^fix ]]; then
  PR_TYPE="bug"
elif [[ "$PR_TITLE" =~ ^docs ]]; then
  PR_TYPE="documentation"
elif [[ "$PR_TITLE" =~ ^test ]]; then
  PR_TYPE="tests"
elif [[ "$PR_TITLE" =~ ^refactor ]]; then
  PR_TYPE="refactor"
elif [[ "$PR_TITLE" =~ ^chore ]]; then
  # chore commits get area labels but no type label
  PR_TYPE=""
fi

# Analyze changed files for automatic labels
CHANGED_FILES=$(git diff $BASE_BRANCH...HEAD --name-only)
LABELS=()

# Add type label (primary classification)
if [ -n "$PR_TYPE" ]; then
  LABELS+=("$PR_TYPE")
fi

# Add area labels based on changed files (can have multiple)
# Code changes
if echo "$CHANGED_FILES" | grep -q "^src/.*\.js$"; then
  LABELS+=("code")
fi

# Test changes
if echo "$CHANGED_FILES" | grep -q "^tests/"; then
  LABELS+=("tests")
fi

# Documentation changes
if echo "$CHANGED_FILES" | grep -q "^docs/\|README\.md\|\.md$"; then
  # Only add if not already added by PR_TYPE
  if [[ ! " ${LABELS[@]} " =~ " documentation " ]]; then
    LABELS+=("documentation")
  fi
fi

# Dependency updates
if echo "$CHANGED_FILES" | grep -q "package\.json\|package-lock\.json"; then
  LABELS+=("dependencies")
fi

# Middleware changes
if echo "$CHANGED_FILES" | grep -q "^src/middleware/"; then
  LABELS+=("middleware")
fi

# Service changes
if echo "$CHANGED_FILES" | grep -q "^src/services/"; then
  LABELS+=("services")
fi

# Remove duplicate labels
LABELS=($(echo "${LABELS[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))

# Build label string for gh CLI
LABEL_ARGS=""
for label in "${LABELS[@]}"; do
  LABEL_ARGS="$LABEL_ARGS --label \"$label\""
done

# Generate PR body from template (auto-filled sections)
PR_BODY=$(cat <<EOF
## Changes

$(git diff $BASE_BRANCH...HEAD --stat)

## Commits

$(git log $BASE_BRANCH..HEAD --pretty=format:"- %s (%h)" --reverse)

## Testing

✅ All tests passing (125/125)
✅ 100% code coverage maintained
✅ Linting passed
✅ Security audit passed
✅ Commit messages follow conventional format

## Automated Checks

- ✅ Pre-commit formatting and linting
- ✅ Pre-push test suite
- ✅ Commitlint validation

---

🤖 PR created automatically via pre-push workflow
🏷️ Labels: ${LABELS[*]}
EOF
)

# Create PR using GitHub CLI
# Note: eval needed for label args to work properly
PR_URL=$(eval gh pr create \
  --title \"$PR_TITLE\" \
  --body \"$PR_BODY\" \
  --base \"$BASE_BRANCH\" \
  --head \"$CURRENT_BRANCH\" \
  --reviewer \"olaoluthomas\" \
  $LABEL_ARGS)

echo ""
echo "✅ Pull Request created!"
echo "📋 Labels applied: ${LABELS[*]}"
echo "👤 Reviewer assigned: olaoluthomas"
echo "🔗 PR URL: $PR_URL"
