#!/bin/bash
set -e

echo "🏷️  Setting up GitHub labels..."

# Define labels (name:color:description)
LABELS=(
  "enhancement:84B6EB:New feature or request"
  "bug:D73A4A:Something isn't working"
  "documentation:0075CA:Improvements or additions to documentation"
  "tests:BFD4F2:Related to testing"
  "refactor:FBCA04:Code refactoring"
  "code:D4C5F9:Changes to source code"
  "middleware:C2E0C6:Changes to middleware"
  "services:FEF2C0:Changes to services"
  "dependencies:0366D6:Dependency updates"
)

# Create labels
for label_def in "${LABELS[@]}"; do
  IFS=':' read -r name color description <<< "$label_def"

  # Check if label exists
  if gh label list | grep -q "^$name"; then
    echo "✓ Label '$name' already exists"
  else
    gh label create "$name" --color "$color" --description "$description"
    echo "✓ Created label '$name'"
  fi
done

echo ""
echo "✅ GitHub labels configured!"
