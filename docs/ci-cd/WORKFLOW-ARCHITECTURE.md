# CI/CD Workflow Architecture

Source-of-truth document for the GitHub Actions workflow system.

## Workflows Overview

| Workflow | File | Triggers | Purpose |
|----------|------|----------|---------|
| **CI** | `ci.yml` | `pull_request`, `push` (main), `workflow_dispatch` | Lint, test, build, coverage + PR validation gate |
| **Release** | `release.yml` | `push` (main), `workflow_dispatch` | semantic-release: version bump, changelog, GitHub Release |
| **Container** | `container.yml` | `release: published`, `push tags: v*`, `workflow_dispatch` | Build/push Docker image to GHCR |
| **PR Validation** | `pr-validation.yml` | `workflow_dispatch` only | Manual PR re-validation tool |
| **PR CI Watchdog** | `pr-watchdog.yml` | `workflow_dispatch` only | Manual tool to check/re-trigger CI for a PR |

## Workflow Diagram

```
PR opened/updated
  └─→ ci.yml                    (pull_request)
        ├─→ validate-pr          first job: labels, title, issue ref
        │     └─ must pass before CI jobs run
        ├─→ lint                 (needs: validate-pr)
        ├─→ security             (needs: validate-pr)
        ├─→ test-unit            (needs: validate-pr)  [Node 18.x, 20.x]
        ├─→ test-integration     (needs: validate-pr)  [Node 18.x, 20.x]
        ├─→ test-smoke           (needs: validate-pr)  [Node 18.x, 20.x]
        ├─→ build                (needs: validate-pr)
        ├─→ coverage             (needs: validate-pr + all test jobs)
        └─→ ci-status-check      (needs: all above) ← branch protection requires this

Push to main (merge)
  ├─→ ci.yml                    (push) — validate-pr skipped, CI runs directly
  └─→ release.yml               (push) — semantic-release analyzes commits
        └─ creates GitHub Release if releasable commits found

New release published
  └─→ container.yml             (release: published)
        └─ builds & pushes Docker image to GHCR

Manual tools (workflow_dispatch)
  ├─→ pr-validation.yml         input: pr_number — standalone PR validation
  └─→ pr-watchdog.yml           input: pr_number — check if CI ran, re-trigger if missing
```

## Trigger Matrix

| Event | ci.yml | release.yml | container.yml | pr-validation.yml | pr-watchdog.yml |
|-------|--------|-------------|---------------|-------------------|-----------------|
| `pull_request` → main | **validate-pr + CI** | - | - | - | - |
| `push` → main | **CI only** (validate-pr skipped) | **semantic-release** | - | - | - |
| `push` tags `v*` | - | - | **build + push** | - | - |
| `release: published` | - | - | **build + push** | - | - |
| `workflow_dispatch` | **CI only** | **semantic-release** | **build + push** | **validate PR** | **check + re-trigger** |

## paths-ignore Standard

CI and Release workflows skip runs when only these files change:

- `**.md` — all Markdown files
- `docs/**` — documentation directory
- `.github/pull_request_template.md`
- `LICENSE`, `AUTHORS`, `NOTICE`
- `.gitignore`, `.gitattributes`
- `.eslintrc*`, `eslint.config.*` — linter configs
- `.prettierrc*`, `.prettierignore` — formatter configs
- `commitlint.config.*`
- `.editorconfig`
- `.vscode/**`, `.idea/**` — editor directories

Container workflow has no `paths-ignore` (only triggered by releases/tags/manual).

## Concurrency Rules

| Workflow | Concurrency Group | Cancel In-Progress |
|----------|------------------|--------------------|
| CI | `CI-<PR number>` or `CI-refs/heads/main` | Yes |
| Release | `release` (single group) | No (never cancel a release) |
| Container | None | N/A |
| PR Validation | `pr-validation-<PR number>` | Yes |

The CI concurrency group uses PR number for pull_request events, preventing cross-PR cancellations while cancelling outdated runs within the same PR. Push-to-main uses `refs/heads/main` as the group key.

## Branch Protection

**Required status check:** `CI Status Check`

This is the sole required check. It aggregates all CI job results:
- On PRs: validate-pr must pass, then all CI jobs must pass
- On push to main: validate-pr is skipped, CI jobs run directly
- `ci-status-check` job fails if any upstream job fails

## Semantic-Release Flow

1. Push to main triggers `release.yml`
2. `semantic-release` analyzes commits since last release:
   - `feat:` → minor version bump
   - `fix:` → patch version bump
   - `feat!:` or `BREAKING CHANGE:` → major version bump
   - `docs:`, `chore:`, `style:`, `test:`, `refactor:` → no release
3. If releasable commits found:
   - Updates `package.json` version
   - Generates/updates `CHANGELOG.md`
   - Creates git tag and GitHub Release
   - Commits with `[skip ci]` to avoid re-triggering CI
4. GitHub Release `published` event triggers `container.yml`

**Token:** Uses `GITHUB_TOKEN` (or `RELEASE_TOKEN` if configured for protected branch pushes).

**Plugin order** (in `.releaserc.json`):
1. `@semantic-release/commit-analyzer` — determine version bump
2. `@semantic-release/release-notes-generator` — generate release notes
3. `@semantic-release/changelog` — update CHANGELOG.md
4. `@semantic-release/npm` — update package.json (npmPublish: false)
5. `@semantic-release/github` — create GitHub Release
6. `@semantic-release/git` — commit changelog + package.json changes
