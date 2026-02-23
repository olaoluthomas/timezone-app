## [1.6.0](https://github.com/olaoluthomas/timezone-app/compare/v1.5.1...v1.6.0) (2026-02-23)

### Features

* **geolocation:** wire GEOLOCATION_API_KEY through config and service ([#145](https://github.com/olaoluthomas/timezone-app/issues/145)) ([fcf1c25](https://github.com/olaoluthomas/timezone-app/commit/fcf1c256f0dc4f2ab03612e18604daa6d83a2dde)), closes [#133](https://github.com/olaoluthomas/timezone-app/issues/133)

## [1.5.1](https://github.com/olaoluthomas/timezone-app/compare/v1.5.0...v1.5.1) (2026-02-23)

### Bug Fixes

* handle ipapi.co 429 rate limiting with retry backoff ([#134](https://github.com/olaoluthomas/timezone-app/issues/134)) ([970f1eb](https://github.com/olaoluthomas/timezone-app/commit/970f1ebfb66e61865dc0178532ae0bffd665ed99)), closes [#132](https://github.com/olaoluthomas/timezone-app/issues/132)

## [1.5.0](https://github.com/olaoluthomas/timezone-app/compare/v1.4.2...v1.5.0) (2026-02-23)

### Features

* add CI/CD and infrastructure label rules to create-pr script ([#131](https://github.com/olaoluthomas/timezone-app/issues/131)) ([f2eec03](https://github.com/olaoluthomas/timezone-app/commit/f2eec0327e33c7ac22e968b1f82212d44b4115c3)), closes [#130](https://github.com/olaoluthomas/timezone-app/issues/130)

## [1.4.2](https://github.com/olaoluthomas/timezone-app/compare/v1.4.1...v1.4.2) (2026-02-23)

### Bug Fixes

* resolve 9 Trivy CVEs and isolate dev compose service ([#129](https://github.com/olaoluthomas/timezone-app/issues/129)) ([cba7c17](https://github.com/olaoluthomas/timezone-app/commit/cba7c17e5aaa079e7adbb4c4c61e49ff55022f1b)), closes [#128](https://github.com/olaoluthomas/timezone-app/issues/128)

## [1.4.1](https://github.com/olaoluthomas/timezone-app/compare/v1.4.0...v1.4.1) (2026-02-23)

### Bug Fixes

* recalculate currentTime on cache hits for accurate time display ([#126](https://github.com/olaoluthomas/timezone-app/issues/126)) ([a4b471e](https://github.com/olaoluthomas/timezone-app/commit/a4b471e433f714b9c9811dfbdcc7137e878ea6b4)), closes [#107](https://github.com/olaoluthomas/timezone-app/issues/107)

## [1.4.0](https://github.com/olaoluthomas/timezone-app/compare/v1.3.3...v1.4.0) (2026-02-23)

### Features

* **release:** enable CHANGELOG.md generation via semantic-release ([#119](https://github.com/olaoluthomas/timezone-app/issues/119)) ([cb69e6b](https://github.com/olaoluthomas/timezone-app/commit/cb69e6b76e5ee54dbb3201e554e9a873ce62d7ee)), closes [#117](https://github.com/olaoluthomas/timezone-app/issues/117) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#112](https://github.com/olaoluthomas/timezone-app/issues/112)

### Bug Fixes

* **deps:** upgrade semantic-release 24.0.0 → 25.0.3 ([#121](https://github.com/olaoluthomas/timezone-app/issues/121)) ([dd73c3e](https://github.com/olaoluthomas/timezone-app/commit/dd73c3e595172040670bf9da27f814537e8654d7)), closes [#117](https://github.com/olaoluthomas/timezone-app/issues/117) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#112](https://github.com/olaoluthomas/timezone-app/issues/112) [#120](https://github.com/olaoluthomas/timezone-app/issues/120)
* **release:** upgrade Node.js to 22.x for semantic-release v25 ([#125](https://github.com/olaoluthomas/timezone-app/issues/125)) ([69122e2](https://github.com/olaoluthomas/timezone-app/commit/69122e25f9d054b202ebda5d9a27e47c296e9a9a)), closes [#124](https://github.com/olaoluthomas/timezone-app/issues/124)
