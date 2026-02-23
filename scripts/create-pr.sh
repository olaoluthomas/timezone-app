#!/bin/bash
set -e

# PR creation with automated labeling.
# AI assistants: Prefer GitHub MCP `create_pull_request` with labels derived
# from commit type and changed files. Fall back to this script if MCP fails.
# See CLAUDE.md "GitHub MCP Tools (AI Assistants)" for the full tool mapping.

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_BRANCH="${1:-main}"  # Default to main

# Extract issue number from branch name (format: type/issue-N-description or type/N-description)
ISSUE_NUMBER=""
if [[ "$CURRENT_BRANCH" =~ ^(feat|feature|fix|bugfix|docs|refactor|test|chore|ci)/issue-([0-9]+) ]]; then
  ISSUE_NUMBER="${BASH_REMATCH[2]}"
  echo "📋 Detected issue #$ISSUE_NUMBER from branch name"
elif [[ "$CURRENT_BRANCH" =~ ^(feat|feature|fix|bugfix|docs|refactor|test|chore|ci)/([0-9]+) ]]; then
  ISSUE_NUMBER="${BASH_REMATCH[2]}"
  echo "📋 Detected issue #$ISSUE_NUMBER from branch name"
else
  echo "⚠️  WARNING: No issue number detected in branch name"
  echo "   Expected format: type/issue-N-description or type/N-description"
  echo "   The PR will be created but you must manually add 'Closes #N' to the description"
  echo ""
  echo "   Only skip issue reference for:"
  echo "   - Typo fixes (use 'chore: fix typo in...')"
  echo "   - Urgent hotfixes (create issue retroactively)"
  echo ""
  read -p "   Continue without issue reference? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ PR creation cancelled"
    exit 1
  fi
fi

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
if echo "$CHANGED_FILES" | grep -q "^docs/\|README\.md\|\.md$\|\.env\.example$"; then
  # Only add if not already added by PR_TYPE
  if [[ ! " ${LABELS[@]} " =~ " documentation " ]]; then
    LABELS+=("documentation")
  fi
fi

# Dependency updates (package manifests, Dockerfile base image, lock files)
if echo "$CHANGED_FILES" | grep -q "package\.json\|package-lock\.json\|Dockerfile"; then
  LABELS+=("dependencies")
fi

# CI/CD changes (GitHub Actions workflows, scripts used by CI)
if echo "$CHANGED_FILES" | grep -q "^\.github/workflows/\|^\.github/actions/"; then
  LABELS+=("ci-cd")
fi

# Infrastructure changes (Docker, Compose, container config)
if echo "$CHANGED_FILES" | grep -q "Dockerfile\|docker-compose\|\.dockerignore"; then
  LABELS+=("infrastructure")
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

# Build label flags for gh CLI
LABEL_ARGS=""
for label in "${LABELS[@]}"; do
  LABEL_ARGS="$LABEL_ARGS --label \"$label\""
done

# Generate issue reference for PR body
if [ -n "$ISSUE_NUMBER" ]; then
  ISSUE_REFERENCE="Closes #$ISSUE_NUMBER"
else
  ISSUE_REFERENCE="⚠️ **REQUIRED**: Add issue reference below or explain why none exists"
fi

# Use PR title as summary seed (more descriptive than oldest commit on stacked branches)
FIRST_COMMIT="$PR_TITLE"

# Generate PR body from template (concise, value-focused)
PR_BODY=$(cat <<'EOF'
## Summary

FIRST_COMMIT_PLACEHOLDER

## Related Issue

ISSUE_REFERENCE_PLACEHOLDER

## Impact

-
EOF
)

# Replace placeholders with actual values
PR_BODY="${PR_BODY//FIRST_COMMIT_PLACEHOLDER/$FIRST_COMMIT}"
PR_BODY="${PR_BODY//ISSUE_REFERENCE_PLACEHOLDER/$ISSUE_REFERENCE}"

# Write PR body to temporary file to avoid quoting issues
PR_BODY_FILE=$(mktemp)
echo "$PR_BODY" > "$PR_BODY_FILE"

# Create PR via gh CLI (fallback path when GitHub MCP is unavailable)
# Note: Using --body-file to avoid shell quoting issues with special characters
# eval needed for label args to work properly
PR_URL=$(eval gh pr create \
  --title \"$PR_TITLE\" \
  --body-file \"$PR_BODY_FILE\" \
  --base \"$BASE_BRANCH\" \
  --head \"$CURRENT_BRANCH\" \
  --reviewer \"olaoluthomas\" \
  $LABEL_ARGS)

# Clean up temp file
rm -f "$PR_BODY_FILE"

echo ""
echo "✅ Pull Request created!"
echo "📋 Labels applied: ${LABELS[*]}"
echo "👤 Reviewer assigned: olaoluthomas"
echo "🔗 PR URL: $PR_URL"
