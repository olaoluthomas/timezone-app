# Timezone App - Issue Categorization Quick Reference

**Last Updated:** 2026-02-10
**Total Open Issues:** 19

---

## 📊 Overview by Category

```
Total Open Issues: 19
├── Security & Bug Fixes:     2 issues (11%)  🔴 HIGH PRIORITY
├── New Feature Requests:     9 issues (47%)  🟢 MEDIUM PRIORITY
├── Refactoring/Technical:    7 issues (37%)  🟡 MEDIUM-HIGH PRIORITY
└── Infrastructure/DevOps:    1 issue  (5%)   🟡 MEDIUM PRIORITY
```

---

## 🔴 SECURITY & BUG FIXES (2 Issues)

| # | Title | Priority | Effort | Labels |
|---|-------|----------|--------|--------|
| **#56** | Address 6 high-severity dev dependency vulnerabilities | 🔴 HIGH | 1 hour | - |
| **#57** | Address 2 medium-severity dev dependency vulnerabilities | 🟡 MEDIUM | 30 min | - |

**Total Estimated Effort:** 1.5 hours

---

## ✨ NEW FEATURE REQUESTS (9 Issues)

### Milestone 1: Globe view integration (5 issues)

| # | Title | Milestone | Labels |
|---|-------|-----------|--------|
| **#71** | Integrate globe view of location | Globe view integration | enhancement |
| **#72** | Create globe in UI | Globe view integration | enhancement |
| **#73** | Make globe 3D | Globe view integration | enhancement |
| **#74** | Integrate map view and terrain view | Globe view integration | enhancement |
| **#75** | Integrate tooltip that engages on user click | Globe view integration | enhancement |

### Milestone 2: App Analytics Integration (4 issues)

| # | Title | Milestone | Labels |
|---|-------|-----------|--------|
| **#76** | Integrate App Metrics & Dashboard | App Analytics Integration | infrastructure |
| **#77** | App DB deployment | App Analytics Integration | - |
| **#78** | User interaction collection | App Analytics Integration | - |
| **#79** | Dashboard deployment | App Analytics Integration | - |

**Total Milestones:** 2
**Total Estimated Effort:** TBD (requires detailed scoping)

---

## 🔧 REFACTORING & TECHNICAL IMPROVEMENTS (7 Issues)

### Sprint 1: Code Quality & Testing (3 issues)

| # | Title | Priority | Effort | Impact | Risk |
|---|-------|----------|--------|--------|------|
| **#33** | Eliminate code duplication in geolocation.js (~50 lines) | 🔴 HIGH | 2h | ⭐⭐⭐⭐⭐ | 🔥 LOW |
| **#34** | Extract test helper utilities (eliminate 49+ nock setups) | 🟡 MEDIUM | 2.5h | ⭐⭐⭐⭐ | 🔥 VERY LOW |
| **#35** | Extract route handlers to controller layer (MVC) | 🔴 HIGH | 3h | ⭐⭐⭐⭐ | 🔥 LOW |

**Sprint 1 Total:** 7.5 hours

### Sprint 2: Middleware & Configuration (4 issues)

| # | Title | Priority | Effort | Impact | Risk |
|---|-------|----------|--------|--------|------|
| **#36** | Add centralized error handler middleware | 🔴 HIGH | 2h | ⭐⭐⭐⭐ | 🔥 LOW |
| **#38** | Add request/response logging middleware | 🟡 MEDIUM | 1.5h | ⭐⭐⭐⭐ | 🔥 LOW |
| **#39** | Centralize configuration management with validation | 🟡 MEDIUM | 2h | ⭐⭐⭐⭐ | 🔥 LOW |
| **#32** | Upgrade nock from v13 to v14 | 🟡 MEDIUM | TBD | ⭐⭐⭐ | 🔥 MEDIUM |

**Sprint 2 Total:** 5.5 hours + TBD

**Refactoring Total:** 13+ hours

---

## 🏗️ INFRASTRUCTURE & DEVOPS (1 Issue)

| # | Title | Priority | Effort | Labels |
|---|-------|----------|--------|--------|
| **#30** | Create Kubernetes manifest files for environment deployments | 🟡 MEDIUM | 3-4h | enhancement, infrastructure |

**Total Estimated Effort:** 3-4 hours

---

## 📈 Issue Distribution by Label

| Label | Count | Issues |
|-------|-------|--------|
| **enhancement** | 16 | #30, #32-36, #38-39, #71-76 |
| **refactor** | 7 | #33-36, #38-39 |
| **infrastructure** | 2 | #30, #76 |
| **middleware** | 3 | #36, #38 |
| **code** | 4 | #33, #35, #39 |
| **services** | 1 | #33 |
| **tests** | 1 | #34 |
| **dependencies** | 1 | #32 |

---

## 🎯 Recommended Prioritization

### 🔴 Critical Path (Do First)
**Estimated Time:** 8.5 hours

1. **#56** - Security: 6 high-severity vulnerabilities (1h)
2. **#57** - Security: 2 medium-severity vulnerabilities (0.5h)
3. **#33** - Eliminate code duplication (2h)
4. **#35** - MVC pattern implementation (3h)
5. **#36** - Centralized error handling (2h)

**Rationale:** Security fixes first, then foundational code quality improvements that unlock other work.

---

### 🟡 High Value (Do Next)
**Estimated Time:** 6 hours

6. **#34** - Extract test helpers (2.5h)
7. **#38** - Request/response logging (1.5h)
8. **#39** - Configuration management (2h)

**Rationale:** Improves developer productivity and production observability.

---

### 🟢 Strategic (Do Later)
**Estimated Time:** 3-4 hours

9. **#30** - Kubernetes manifests (3-4h)
10. **#32** - Upgrade nock v14 (TBD)

**Rationale:** Important for infrastructure but not blocking current work.

---

### 🔵 Feature Development (Plan & Execute)
**Estimated Time:** TBD

**Milestone 1: Globe view integration**
- Issues: #71, #72, #73, #74, #75
- Dependencies: UI framework selection, 3D library evaluation
- Requires: Product requirements, design mockups

**Milestone 2: App Analytics Integration**
- Issues: #76, #77, #78, #79
- Dependencies: Database selection, dashboard framework
- Requires: Data model design, metrics specification

**Rationale:** Requires detailed planning and scoping before execution.

---

## 📋 Project Board Configuration

**Board:** [Timezone App - AI-assisted](https://github.com/users/olaoluthomas/projects/3)

### Views:
- **Kanban View:** Todo → In Progress → Done
- **Feature Requests View:** Table layout with all metadata

### Current Status:
```
Todo:         19 issues (100%)
In Progress:  0 issues (0%)
Done:         0 issues (0%)
```

### Milestones:
1. **Globe view integration** - 5 issues
2. **App Analytics Integration** - 4 issues

---

## 🔍 Quick Lookup Tables

### By Estimated Effort:

| Time Range | Count | Issues |
|------------|-------|--------|
| < 1 hour | 1 | #57 |
| 1-2 hours | 4 | #33, #36, #38-39, #56 |
| 2-3 hours | 2 | #34, #35 |
| 3-4 hours | 1 | #30 |
| TBD | 11 | #32, #71-79 |

### By Risk Level:

| Risk | Count | Issues |
|------|-------|--------|
| 🔥 VERY LOW | 1 | #34 |
| 🔥 LOW | 6 | #33, #35-36, #38-39, #56-57 |
| 🔥 MEDIUM | 1 | #32 |
| 🔥 TBD | 11 | #30, #71-79 |

### By Impact:

| Impact | Count | Issues |
|--------|-------|--------|
| ⭐⭐⭐⭐⭐ (Critical) | 1 | #33 |
| ⭐⭐⭐⭐ (High) | 6 | #34-36, #38-39 |
| ⭐⭐⭐ (Medium) | 1 | #32 |
| TBD | 11 | #30, #56-57, #71-79 |

---

## 📝 Notes

### Security Issues:
- **Must be addressed immediately** - Issues #56 and #57
- Run `npm audit` after fixing to verify resolution
- Update CHANGELOG.md with security fixes

### Refactoring Work:
- All refactoring issues have **clear acceptance criteria**
- All have **comprehensive test requirements**
- Most are **low risk** with high success likelihood
- Follow **Sprint 1 → Sprint 2** order for optimal flow

### Feature Requests:
- Organized into **logical milestones**
- Require **detailed scoping** before implementation
- Need **product/design input** for requirements
- Consider **UI/UX design phase** before development

### Infrastructure:
- Kubernetes manifests ready when needed
- Not blocking current development work
- Can be developed in parallel with other work

---

## 🚀 Getting Started

To start working on issues:

1. **Claim an issue** in the project board
2. **Move to "In Progress"** column
3. **Create a branch:** `type/issue-N-description`
4. **Work on the issue** following acceptance criteria
5. **Create PR** using `npm run create-pr` (automated)
6. **Update project board** when done

---

**Repository:** https://github.com/olaoluthomas/timezone-app
**Project Board:** https://github.com/users/olaoluthomas/projects/3
**Documentation:** `/timezone/docs/`
