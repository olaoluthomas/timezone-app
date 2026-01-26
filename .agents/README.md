# Timezone Project Agents

Project-specific patterns and guidelines for the timezone web application.

## Overview

This directory contains patterns and practices specific to the timezone project. For universal patterns (git workflow, testing, documentation), see `agents/`.

## Project-Specific Agents

### 1. Express API Patterns
**Location**: `express-api/`
**Purpose**: Express.js specific patterns used in this project

**Key Patterns**:
- Middleware organization and order
- Route handler structure
- Error handling middleware
- Health check implementation

**When to Use**:
- Building new API endpoints
- Adding middleware
- Implementing error handling
- Creating health checks

---

### 2. Geolocation Domain
**Location**: `geolocation/`
**Purpose**: Domain-specific patterns for IP geolocation and timezone

**Key Patterns**:
- Caching strategy (24h TTL, 10k entries)
- IP normalization (IPv4/IPv6)
- External API integration (ipapi.co)
- Error handling and fallbacks

**When to Use**:
- Working with geolocation service
- Optimizing cache performance
- Integrating new geolocation providers
- Handling timezone data

---

## How to Use

### For New Features

1. **Check Universal Agents First**
   ```bash
   # See if pattern exists in universal agents
   ls ../../agents/
   ```

2. **Check Project Agents**
   ```bash
   # Check project-specific patterns
   ls .agents/
   ```

3. **Create New Pattern If Needed**
   - Document in appropriate agent directory
   - Include examples from codebase
   - Update this README

### For Code Review

- Reference relevant patterns
- Ensure consistency with established patterns
- Suggest pattern improvements if found

### For Onboarding

New developers should review:
1. Root `SOP.md` - Universal workflows
2. Project `CLAUDE.md` - Project overview
3. This README - Project-specific patterns
4. Individual agent directories

---

## Pattern Hierarchy

```
Universal Patterns (agents/)
↓
Apply to ALL projects
↓
Override with project-specific patterns (.agents/)
↓
Apply to THIS project only
```

**Example**:
- Universal: "Use Jest for testing" (all projects)
- Project-specific: "Mock ipapi.co with Nock" (timezone only)

---

## Contributing Patterns

When you discover a useful pattern:

1. **Is it universal?**
   - YES → Add to `agents/`
   - NO → Add to `.agents/`

2. **Document it**
   - Create markdown file
   - Include code examples
   - Explain when to use
   - Note tradeoffs

3. **Reference it**
   - Update this README
   - Link from relevant docs
   - Mention in code reviews

---

## See Also

- [../../SOP.md](../../SOP.md) - Master SOP
- [../CLAUDE.md](../CLAUDE.md) - Project overview
- [../../agents/](../../agents/) - Universal agents
