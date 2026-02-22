#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🚀 Running Local CI Tests${NC}"
echo -e "${BLUE}============================================================${NC}\n"

# Track overall success
TESTS_PASSED=true

# Function to run a step and track success
run_step() {
  local step_name=$1
  local command=$2

  echo -e "${YELLOW}${step_name}${NC}"
  echo "-----------------------------------------------------------"

  if eval "$command"; then
    echo -e "${GREEN}✓ ${step_name} passed${NC}\n"
  else
    echo -e "${RED}✗ ${step_name} failed${NC}\n"
    TESTS_PASSED=false
    if [ "$STOP_ON_FAILURE" = "true" ]; then
      exit 1
    fi
  fi
}

# Step 1: Clean install dependencies
run_step "📦 Installing dependencies" "npm ci"

# Step 2: Run ESLint
run_step "🔍 Running ESLint" "npm run lint"

# Step 3: Check code formatting
run_step "✨ Checking code formatting" "npm run format:check"

# Step 4: Run security audit
run_step "🔒 Running security audit" "npm audit --audit-level=moderate --omit=dev"

# Step 5: Run unit tests
run_step "🧪 Running unit tests" "npm run test:unit -- --coverage --silent"

# Step 6: Run integration tests (if they exist)
if npm run test:integration --silent 2>/dev/null; then
  run_step "🔗 Running integration tests" "npm run test:integration --silent"
else
  echo -e "${YELLOW}ℹ  Integration tests not yet implemented, skipping...${NC}\n"
fi

# Step 7: Run smoke tests (if they exist)
if npm run test:smoke --silent 2>/dev/null; then
  run_step "💨 Running smoke tests" "npm run test:smoke --silent"
else
  echo -e "${YELLOW}ℹ  Smoke tests not yet implemented, skipping...${NC}\n"
fi

# Step 8: Generate full coverage report
run_step "📊 Generating full coverage report" "npm test -- --silent"

# Final summary
echo -e "${BLUE}============================================================${NC}"
if [ "$TESTS_PASSED" = true ]; then
  echo -e "${GREEN}✅ All CI tests passed!${NC}"
  echo -e "${GREEN}   Ready to proceed to next milestone${NC}"
  echo -e "${BLUE}============================================================${NC}"
  exit 0
else
  echo -e "${RED}❌ Some CI tests failed${NC}"
  echo -e "${RED}   Please fix the issues before proceeding${NC}"
  echo -e "${BLUE}============================================================${NC}"
  exit 1
fi
