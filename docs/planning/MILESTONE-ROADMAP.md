# Milestone Roadmap

**Purpose:** High-level visualization of the timezone-app project roadmap across development phases.

**Last Updated:** 2026-02-23

---

## Overview

The timezone-app project is organized into three phases:
- **Phase 1 (Complete):** Core features and production readiness
- **Phase 2 (Planned):** Code quality, architecture, and infrastructure improvements
- **Phase 3 (Planned):** User-facing feature enhancements

---

## Phase 1: Core Features & Production Readiness ✅ COMPLETE

**Status:** 9/9 milestones complete (100%)
**Duration:** January 2026
**Focus:** Build production-ready timezone application with comprehensive testing and CI/CD

### Milestones Overview

| Milestone | Theme | Duration | Status |
|-----------|-------|----------|--------|
| M1 | Caching Layer with Tests | 3h | ✅ Complete |
| M2 | Code Quality Tools | 1h | ✅ Complete |
| M3 | Integration Tests | 2h | ✅ Complete |
| M4 | Health Check Endpoints | 2-3h | ✅ Complete |
| M5 | Security Middleware | 6h | ✅ Complete |
| M6 | Structured Logging (Winston) | 4h | ✅ Complete |
| M8 | CI/CD Pipeline (GitHub Actions) | 2h | ✅ Complete |
| M9 | Graceful Shutdown | 2h | ✅ Complete |

**Total Phase 1 Effort:** 22-23 hours
**Key Achievements:**
- ✅ 213 tests passing with 96.68% coverage
- ✅ Production-ready with Docker/K8s health probes
- ✅ GitHub Actions CI/CD (7 jobs)
- ✅ Zero-downtime deployments (graceful shutdown)
- ✅ Structured logging with Winston
- ✅ Comprehensive security middleware
- ✅ Automated git workflow (Husky + Commitlint)

---

## Phase 2: Code Quality & Infrastructure 📋 PLANNED

**Status:** 0/3 milestones complete (0%)
**Estimated Start:** February 2026
**Focus:** Improve code maintainability, establish clean architecture, complete deployment infrastructure

### Milestones Overview

| Milestone | Theme | Duration | Impact | Status |
|-----------|-------|----------|--------|--------|
| M10 | Code Quality, DX & Security | 8h | ⭐⭐⭐⭐⭐ | 📋 Planned |
| M11 | MVC Architecture & Configuration | 7h | ⭐⭐⭐⭐⭐ | 📋 Planned |
| M12 | Container Deployment Infrastructure | 3-4h | ⭐⭐⭐⭐ | 📋 Planned |

**Total Phase 2 Effort:** 18-19 hours (was 16.5-17.5h)
**Expected Timeline:** 2-3 weeks

---

## Milestone 10: Code Quality, Developer Experience & Security

**Duration:** 8 hours (was 6.5h)
**Impact:** ⭐⭐⭐⭐⭐ Critical (maintainability, developer experience, security)

### Focus Areas
- Eliminate code duplication (~50 lines in geolocation.js)
- Improve test maintainability (~200 lines of duplicate test setup)
- Enhance debugging with request/response logging
- Improve developer onboarding with .env.example
- **Address 8 security scan findings from Trivy container scanning**
- **Document security scanning workflow** (completed)

### Issues Included
- [#33](https://github.com/olaoluthomas/timezone-app/issues/33) - Eliminate duplication in geolocation.js (2h)
- [#34](https://github.com/olaoluthomas/timezone-app/issues/34) - Extract test helper utilities (2.5h)
- [#38](https://github.com/olaoluthomas/timezone-app/issues/38) - Request/response logging middleware (1.5h)
- [#40](https://github.com/olaoluthomas/timezone-app/issues/40) - Add .env.example file (30min)
- [#56](https://github.com/olaoluthomas/timezone-app/issues/56) - Address 6 high-severity dev dependency vulnerabilities (1h)
- [#57](https://github.com/olaoluthomas/timezone-app/issues/57) - Address 2 medium-severity dev dependency vulnerabilities (30min)
- ~~[#58](https://github.com/olaoluthomas/timezone-app/issues/58)~~ - Dependabot already configured (closed as duplicate)
- [#32](https://github.com/olaoluthomas/timezone-app/issues/32) - Upgrade nock from v13 to v14
- [#111](https://github.com/olaoluthomas/timezone-app/issues/111) - Resolve Jest dependency vulnerabilities (minimatch via glob)
- [#133](https://github.com/olaoluthomas/timezone-app/issues/133) - Support GEOLOCATION_API_KEY for dev and production deployments
- [#135](https://github.com/olaoluthomas/timezone-app/issues/135) - Differentiate frontend error messages by HTTP status

### Deliverables
1. **New Utility Classes:**
   - `src/utils/ip-validator.js` - IP validation/normalization + 15 tests
   - `src/utils/date-formatter.js` - Date formatting logic + 8 tests

2. **Test Infrastructure:**
   - `tests/helpers/nock-mocks.js` - Centralized fixtures
   - `tests/helpers/test-setup.js` - Common setup

3. **Middleware:**
   - `src/middleware/request-logger.js` - HTTP logging + 10 tests

4. **Documentation:**
   - `.env.example` - Environment configuration template
   - Updated `README.md` - Environment setup guide

5. **Security:**
   - Security vulnerability remediation (8 alerts resolved)
   - ~~`.github/dependabot.yml`~~ - Already configured (2026-01-26)
   - ✅ `docs/SECURITY-SCANNING-WORKFLOW.md` - Completed (2026-02-08)

### Success Metrics
- ✅ ~330 lines of code reduced
- ✅ 23+ new tests (236 total)
- ✅ Coverage maintained at 96%+
- ✅ Developer onboarding time reduced
- ✅ **All 8 security alerts resolved in GitHub Security**
- ✅ **Dependabot operational and creating automated PRs**

---

## Milestone 11: MVC Architecture & Configuration

**Duration:** 7 hours
**Impact:** ⭐⭐⭐⭐⭐ Critical (scalability, architecture foundation)

### Focus Areas
- Establish clean MVC architecture pattern
- Implement professional error handling
- Centralize configuration with validation
- Simplify app.js (110 → 75 lines)

### Issues Included
- [#35](https://github.com/olaoluthomas/timezone-app/issues/35) - Extract route handlers to controllers (3h)
- [#36](https://github.com/olaoluthomas/timezone-app/issues/36) - Centralized error handler middleware (2h)
- [#39](https://github.com/olaoluthomas/timezone-app/issues/39) - Centralize configuration management (2h)

### Deliverables
1. **Controllers (MVC Pattern):**
   - `src/controllers/healthController.js` - Health endpoints + 15 tests
   - `src/controllers/timezoneController.js` - Timezone endpoint + 10 tests

2. **Error Handling:**
   - `src/middleware/error-handler.js` - Centralized handler + APIError class + 12 tests

3. **Configuration Management:**
   - `src/config/index.js` - Config class with validation + 15 tests

4. **Refactored Code:**
   - `src/app.js` - Simplified to ~75 lines (routing-only)

### Success Metrics
- ✅ Clean MVC separation of concerns
- ✅ Consistent error responses (no stack trace leaks in prod)
- ✅ Configuration validated on startup (fail-fast)
- ✅ 55+ new tests (268 total)
- ✅ app.js reduced by 35 lines

### Why This Matters
- **Scalability:** Easy to add new endpoints/controllers
- **Maintainability:** Clear separation of concerns
- **Production Quality:** Professional error handling and config validation
- **Foundation:** Sets pattern for future development

---

## Milestone 12: Container Deployment Infrastructure

**Duration:** 3-4 hours (K8s manifests)
**Impact:** ⭐⭐⭐⭐ High (deployment infrastructure, operations)

### Context: Deployment Options Considered

The app already has a documented, operational deployment path using **Podman (rootless)** and **Docker**, covered in the [Container Deployment Guide](https://github.com/olaoluthomas/timezone-app/wiki/Container-Deployment-Guide) wiki. That guide covers:
- Podman rootless container deployment on a VM
- systemd service with auto-restart
- Watchtower for automated image updates
- Caddy reverse proxy with TLS
- Firewall configuration

M12 extends this to **Kubernetes**, creating manifest files for baremetal cluster deployment. Both paths are first-class deployment options.

### Focus Areas
- Create minimal Kubernetes manifests for baremetal cluster deployment
- Single replica (stateless app — no database, no sidecars, no PVCs)
- Leverage existing health probes (`/health`, `/health/ready`) and graceful shutdown
- Reference wiki for Podman/Docker deployment alongside new K8s docs

### Issues Included
- [#30](https://github.com/olaoluthomas/timezone-app/issues/30) - Create Kubernetes manifest files (3-4h)

### Deliverables
1. **Kubernetes Manifests (flat `k8s/` directory):**
   - `k8s/deployment.yaml` - Single replica deployment with security context
   - `k8s/service.yaml` - ClusterIP service (port 80 → 3000)
   - `k8s/ingress.yaml` - Optional ingress with TLS placeholder

2. **Documentation:**
   - Updated `README.md` with K8s deployment commands
   - Cross-reference to [Container Deployment Guide](https://github.com/olaoluthomas/timezone-app/wiki/Container-Deployment-Guide) wiki for Podman/Docker path

### Deployment Options Summary

| Option | Status | Documentation |
|--------|--------|---------------|
| Podman (rootless) | ✅ Operational | [Container Deployment Guide wiki](https://github.com/olaoluthomas/timezone-app/wiki/Container-Deployment-Guide) |
| Docker | ✅ Operational | [Container Deployment Guide wiki](https://github.com/olaoluthomas/timezone-app/wiki/Container-Deployment-Guide) |
| Kubernetes (baremetal) | 📋 M12 deliverable | `k8s/` manifests (to be created) |

### Success Metrics
- ✅ Manifests validated with `kubectl apply --dry-run=server`
- ✅ Health probes configured (liveness/readiness)
- ✅ Security context set (`runAsNonRoot`, `readOnlyRootFilesystem`, dropped capabilities)
- ✅ Rolling update strategy configured
- ✅ README cross-references wiki for Podman/Docker path

### Why This Matters
- **Deployment Flexibility:** Operators can choose Podman/Docker (VM) or K8s (cluster) depending on their infrastructure
- **Operations:** Leverages health probes and graceful shutdown already in place from M9
- **Baremetal Ready:** Targets existing clusters — no cloud-provider dependency

---

## Phase 3: Feature Enhancements 📋 PLANNED

**Status:** 0/3 milestones complete (0%)
**Estimated Start:** After Phase 2
**Focus:** User-facing features leveraging the improved Phase 2 codebase

### Milestones Overview

| Milestone | Theme | Duration | Impact | Status |
|-----------|-------|----------|--------|--------|
| M13 | Globe View Integration | TBD | ⭐⭐⭐⭐⭐ | 📋 Planned |
| M14 | App Analytics Integration | TBD | ⭐⭐⭐⭐ | 📋 Planned |
| M15 | Weather Integration | TBD | ⭐⭐⭐⭐ | 📋 Planned |

---

## Milestone 13: Globe View Integration

**Duration:** TBD
**Impact:** ⭐⭐⭐⭐⭐ High (user experience, visual appeal, feature differentiation)

### Focus Areas
- Interactive 3D globe visualization with user location pin
- Tooltip on hover showing IP address and coordinates
- Multiple view modes (3D, map, terrain)

### Issues Included
- [#71](https://github.com/olaoluthomas/timezone-app/issues/71) - Integrate globe view of location
- [#72](https://github.com/olaoluthomas/timezone-app/issues/72) - Create globe in UI
- [#73](https://github.com/olaoluthomas/timezone-app/issues/73) - Make globe 3D
- [#74](https://github.com/olaoluthomas/timezone-app/issues/74) - Integrate map view and terrain view
- [#75](https://github.com/olaoluthomas/timezone-app/issues/75) - Integrate tooltip that engages on user click

### Deliverables
1. **Globe Component:**
   - 3D globe (Three.js or similar) with location pin
   - Interactive tooltip (IP, lat/long on hover)
2. **View Modes:**
   - 3D globe, map view, terrain view
3. **Frontend Integration:**
   - Responsive globe rendering
   - Tests for globe components

### Success Metrics
- ✅ 3D globe renders across browsers with location pin
- ✅ Tooltip displays IP and coordinates correctly
- ✅ Multiple view modes functional
- ✅ Performance maintained (60fps target)
- ✅ All tests passing

---

## Milestone 14: App Analytics Integration

**Duration:** TBD
**Impact:** ⭐⭐⭐⭐ High (product insights, performance monitoring)

### Focus Areas
- Database infrastructure for user interaction data and performance metrics
- Analytics dashboard
- Privacy-compliant tracking (GDPR/CCPA)

### Issues Included
- [#76](https://github.com/olaoluthomas/timezone-app/issues/76) - Integrate App Metrics & Dashboard
- [#77](https://github.com/olaoluthomas/timezone-app/issues/77) - App DB deployment
- [#78](https://github.com/olaoluthomas/timezone-app/issues/78) - User interaction collection
- [#79](https://github.com/olaoluthomas/timezone-app/issues/79) - Dashboard deployment

### Deliverables
1. **Data Infrastructure:**
   - Analytics database (PostgreSQL/MongoDB)
   - User interaction tracking service
   - Performance metrics collection
2. **Dashboard:**
   - Analytics API endpoints
   - Dashboard UI with real-time data

### Success Metrics
- ✅ Database deployed and collecting data
- ✅ Dashboard displays real-time analytics
- ✅ Privacy compliance ensured (anonymization, opt-out)
- ✅ <5ms performance overhead

---

## Milestone 15: Weather Integration

**Duration:** TBD
**Impact:** ⭐⭐⭐⭐ High (user experience, leverages existing geolocation data)

### Focus Areas
- Integrate current weather data using existing geolocation coordinates
- Use Open-Meteo API (free, no API key required)
- Add weather card to frontend alongside existing time/location info
- Graceful degradation — weather failure does not break the app

### Issues Included
- [#127](https://github.com/olaoluthomas/timezone-app/issues/127) - Integrate current weather data using geolocation coordinates

### Deliverables
1. **Weather Service:**
   - `src/services/weather.js` — Open-Meteo API client with WMO code mapping
   - Weather data cached with 15-30 min TTL (shorter than 24h geolocation TTL)
2. **API Response:**
   - `weather` object added to `GET /api/timezone` response
   - `null` on weather fetch failure (graceful degradation)
3. **Frontend:**
   - Weather card in UI (temperature, condition, wind, humidity)
   - Hidden gracefully if `weather` is null
4. **Tests:**
   - Unit tests for weather service (mocked API responses)
   - Integration test for weather field in API response

### Success Metrics
- ✅ Weather data displayed alongside existing location/time info
- ✅ Weather fetch failure does not break the app
- ✅ Weather cached with appropriate TTL
- ✅ All existing tests still pass

---

## Milestone 15: Weather Integration

**Duration:** TBD
**Impact:** ⭐⭐⭐⭐ High (user-facing feature, leverages existing geolocation data)

### Focus Areas
- Integrate current weather data using existing geolocation coordinates
- Use Open-Meteo API (free, no API key required)
- Add weather card to frontend alongside existing time/location info
- Graceful degradation — weather failure should not break the app

### Issues Included
- [#127](https://github.com/olaoluthomas/timezone-app/issues/127) - Integrate current weather data using geolocation coordinates

### Deliverables
1. **Weather Service:**
   - `src/services/weather.js` — Open-Meteo API client with WMO code mapping
   - Weather data cached with shorter TTL (15-30 min)
2. **API Response:**
   - `weather` object added to `GET /api/timezone` response
   - `null` on weather fetch failure (graceful degradation)
3. **Frontend:**
   - Weather card in UI (temperature, condition, wind, humidity)
   - Handle missing weather data gracefully
4. **Tests:**
   - Unit tests for weather service (mocked API)
   - Integration test for weather field in API response

### Success Metrics
- ✅ Weather data displayed alongside existing location/time info
- ✅ Weather fetch failure does not break the app
- ✅ Weather cached with appropriate TTL
- ✅ All existing tests still pass
- ✅ New unit and integration tests added

---

## Roadmap Dependencies

### Sequential Dependencies
```
Phase 1 (Complete) → Phase 2 → Phase 3

Within Phase 2:
M10 (Code Quality) → M11 (MVC Architecture) → M12 (Container Deployment)

Phase 3 (can start after Phase 2):
M13 (Globe View) — independent of M14/M15
M14 (Analytics) — depends on M11 (MVC, clean service layer)
M15 (Weather) — depends on M11 (geolocation service refactor complete)
```

**Rationale:**
- **M10 first:** Clean up duplication and improve tests before architectural changes
- **M11 second:** Establish MVC pattern and config management
- **M12 last in Phase 2:** Deploy the improved codebase (Podman/Docker already operational via wiki)
- **Phase 3 after Phase 2:** Feature work benefits from clean MVC architecture

### Why This Order Matters
1. **M10 reduces technical debt** before making architectural changes
2. **M11 establishes patterns** that future features will follow
3. **M12 completes the deployment story** (K8s manifests alongside existing Podman/Docker wiki)
4. **M13/M14/M15 build on the clean Phase 2 codebase**

---

## Issues NOT in Milestones

### Issues Remaining as Standalone
- **#37** - Remove Promise.resolve() wrapper (5min, PR #51 open) - Too small for milestone
- **#52** - Prevent direct commits to main (PR #53 open) - Workflow improvement, not feature
- **#141** - Smoke tests excessive ipapi.co calls - Bug fix, will be addressed outside milestones

### Rationale
- **Too Small:** #37 takes 5 minutes, not worth milestone overhead
- **Already In Progress:** #37, #52 have open PRs
- **Process/Workflow:** #52 and #141 are infrastructure/tooling fixes, not feature milestones

### Previously Standalone, Now Assigned (2026-02-23)
- **#32** → M10 (test infrastructure dependency)
- **#111** → M10 (Jest dependency security)
- **#133** → M10 (developer experience: API key support)
- **#135** → M10 (error handling UX)
- **#127** → M15 (Weather Integration, new milestone)

---

## Success Criteria by Phase

### Phase 1 Success ✅ (Achieved)
- [x] 200+ tests passing with 95%+ coverage
- [x] GitHub Actions CI/CD active
- [x] Production-ready with health probes
- [x] Zero-downtime deployments (graceful shutdown)
- [x] Structured logging operational
- [x] Security hardened

### Phase 2 Success (Target)
- [ ] 300+ tests passing with 96%+ coverage
- [ ] <100 lines of duplicated code
- [ ] Clean MVC architecture established
- [ ] Professional error handling
- [ ] K8s manifests validated and documented (alongside existing Podman/Docker wiki)

### Phase 3 Success (Target)
- [ ] Interactive 3D globe with location pin
- [ ] Analytics dashboard operational
- [ ] Weather data displayed in UI

---

## Progress Tracking

### Phase 1 Progress
```
████████████████████████████████████████ 100% (9/9 milestones)
```

### Phase 2 Progress (M10–M12)
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3 milestones)
```

### Phase 3 Progress (M13–M15)
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3 milestones)
```

### Overall Project Progress
```
Phase 1:  ████████████████████████████████████████ 100% (9/9)
Phase 2:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3)
Phase 3:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/3)
          ────────────────────────────────────────
Overall:  ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  60% (9/15)
```

**Current Status:** Production-ready, Phase 2 and Phase 3 improvements planned

---

## Timeline Estimate

### Phase 1 (Actual)
- **Start:** 2026-01-23
- **End:** 2026-02-01
- **Duration:** ~10 days (22-23 hours of work)

### Phase 2 (Estimated)
- **Start:** 2026-02-10 (estimated)
- **Duration:** 2-3 weeks (16.5-17.5 hours of work)
- **End:** 2026-03-03 (estimated)

**Note:** Actual timeline depends on:
- Available development time
- Issue complexity vs estimates
- Testing and review cycles
- Scope adjustments

---

## Related Documentation

- **Milestone Details:** `docs/MILESTONES.md`
- **Project Overview:** `CLAUDE.md`
- **Refactoring Analysis:** `docs/REFACTORING_STATUS_2026-02-07.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **CI/CD Strategy:** `docs/CI-TESTING.md`

---

## Key Takeaways

### What Makes Phase 2 Different?
- **Phase 1:** Build features → achieve production-ready status
- **Phase 2:** Refine codebase → improve maintainability and deployment

### Why Phase 2 Matters
1. **Technical Debt Reduction:** Eliminate duplication identified in refactoring analysis
2. **Scalability Foundation:** MVC architecture enables easy feature additions
3. **Operational Readiness:** K8s deployment for production-grade operations
4. **Team Velocity:** Better code quality → faster future development

### Success Indicators
- Code review velocity increases (less duplicated code)
- New developer onboarding is faster (.env.example, clear patterns)
- Feature development accelerates (MVC pattern established)
- Deployment is standardized (K8s manifests)

---

*This roadmap is a living document and will be updated as milestones are completed or scope changes.*
