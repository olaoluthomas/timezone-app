# Security Scanning Workflow

## Overview

The timezone-app uses **Trivy container security scanning** integrated into the CI/CD pipeline to automatically detect vulnerabilities in container images.

## How It Works

1. **Automated Scanning** (`.github/workflows/container.yml`):
   - Triggers: Push to main, new tags, manual dispatch
   - Tool: Aqua Security Trivy (latest)
   - Output: SARIF format uploaded to GitHub Security

2. **Results Location**:
   - GitHub Repository → Security tab → Code scanning
   - View: https://github.com/olaoluthomas/timezone-app/security/code-scanning

3. **Alert Notification**:
   - GitHub sends notifications for new security alerts
   - Alerts visible in Security tab with severity levels

## Handling Security Findings

### Step 1: Review Alert
```
# Preferred: GitHub MCP (use API tools for code-scanning alerts)
# Fallback:  gh api repos/olaoluthomas/timezone-app/code-scanning/alerts
```

### Step 2: Create Issue
- Use template: "security: [brief description]"
- Add labels: security, dependencies
- Assign to appropriate milestone
- Include CVE details and remediation steps

### Step 3: Remediate
```bash
# Update dependencies
npm update --save-dev <package>

# Verify fix
npm audit
npm test

# Check if alert resolved
# Preferred: GitHub MCP | Fallback: gh api repos/olaoluthomas/timezone-app/code-scanning/alerts/<alert-id>
```

### Step 4: Verify Resolution
- Alert should move to "closed" state in GitHub Security
- npm audit should show 0 vulnerabilities
- All tests should pass

## Dependabot Integration

**Configuration** (`.github/dependabot.yml`):
- Security updates: Immediate
- Version updates: Weekly
- Auto-merge: Patch updates only (with tests passing)

**Workflow:**
1. Dependabot creates PR
2. CI/CD runs tests automatically
3. If tests pass and update is patch-level → auto-merge
4. If major/minor update → manual review

## Review Schedule

- **Daily**: Check for new security alerts (automated notifications)
- **Weekly**: Review Dependabot PRs
- **Monthly**: Full npm audit review
- **Quarterly**: Security audit and documentation update

**Next Review:** 2026-03-01