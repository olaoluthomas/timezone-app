## [1.8.0](https://github.com/olaoluthomas/timezone-app/compare/v1.7.3...v1.8.0) (2026-05-03)

### Features

* **ui:** create globe component using Globe.GL (Closes [#72](https://github.com/olaoluthomas/timezone-app/issues/72)) ([#183](https://github.com/olaoluthomas/timezone-app/issues/183)) ([4065c44](https://github.com/olaoluthomas/timezone-app/commit/4065c447d7466e84b14c85eaea16b3095180c241))
* **ui:** redesign layout with globe as hero, zoom to user location (Closes [#71](https://github.com/olaoluthomas/timezone-app/issues/71)) ([#184](https://github.com/olaoluthomas/timezone-app/issues/184)) ([82fbf2e](https://github.com/olaoluthomas/timezone-app/commit/82fbf2e6306db1732115af4f9be6ecaaad2ea662))
* **ui:** add location pin with floating label, simplify info strip to 4 chips ([#185](https://github.com/olaoluthomas/timezone-app/issues/185)) ([e7e9a91](https://github.com/olaoluthomas/timezone-app/commit/e7e9a91f2507e42707c142da81e316edd917e223))
* **ui:** improve globe texture resolution and enforce max zoom (Closes [#73](https://github.com/olaoluthomas/timezone-app/issues/73)) ([#186](https://github.com/olaoluthomas/timezone-app/issues/186)) ([626b759](https://github.com/olaoluthomas/timezone-app/commit/626b759431589c972875b7b1a56ba718ce31ea1d))

### Bug Fixes

* **ui:** tighten globe max zoom floor to altitude 0.35 ([#187](https://github.com/olaoluthomas/timezone-app/issues/187)) ([6656063](https://github.com/olaoluthomas/timezone-app/commit/6656063f4a6de2cfbd8911afa69b72e3fe361d7e))

## [1.7.3](https://github.com/olaoluthomas/timezone-app/compare/v1.7.2...v1.7.3) (2026-05-03)

### Code Refactoring

* MVC controller layer and centralized error handler (Closes [#35](https://github.com/olaoluthomas/timezone-app/issues/35), [#36](https://github.com/olaoluthomas/timezone-app/issues/36)) ([#180](https://github.com/olaoluthomas/timezone-app/issues/180)) ([1b27f3e](https://github.com/olaoluthomas/timezone-app/commit/1b27f3e01f2f0885625d7b60819322399db6da87))

## [1.7.2](https://github.com/olaoluthomas/timezone-app/compare/v1.7.1...v1.7.2) (2026-05-02)

### Maintenance

* **deps:** upgrade nock to v14 ([#173](https://github.com/olaoluthomas/timezone-app/issues/173)) ([2c1d2d5](https://github.com/olaoluthomas/timezone-app/commit/2c1d2d5eae329be9ce78a3f1d7a2a1ebabb1792c)), closes [#32](https://github.com/olaoluthomas/timezone-app/issues/32)

## [1.7.1](https://github.com/olaoluthomas/timezone-app/compare/v1.7.0...v1.7.1) (2026-05-02)

### Code Refactoring

* **tests:** extract nock helpers to eliminate duplicate setup ([#171](https://github.com/olaoluthomas/timezone-app/issues/171)) ([f5ca6de](https://github.com/olaoluthomas/timezone-app/commit/f5ca6de58382d6ef60d6d884dda57c7ad8314cd4)), closes [#34](https://github.com/olaoluthomas/timezone-app/issues/34)

## [1.7.0](https://github.com/olaoluthomas/timezone-app/compare/v1.6.4...v1.7.0) (2026-05-02)

### Features

* **geolocation:** use API key as fallback when free tier is rate-limited ([#170](https://github.com/olaoluthomas/timezone-app/issues/170)) ([553d5e1](https://github.com/olaoluthomas/timezone-app/commit/553d5e1bd7ebf183b89f0e248f6e31ff3ece391e)), closes [#169](https://github.com/olaoluthomas/timezone-app/issues/169)

## [1.6.4](https://github.com/olaoluthomas/timezone-app/compare/v1.6.3...v1.6.4) (2026-05-01)

### Code Refactoring

* **deps:** drop semantic-release from devDependencies ([#166](https://github.com/olaoluthomas/timezone-app/issues/166)) ([f2564c7](https://github.com/olaoluthomas/timezone-app/commit/f2564c718c8763952172a446f9293aaca72758d2)), closes [#165](https://github.com/olaoluthomas/timezone-app/issues/165)

### Maintenance

* **deps-dev:** bump @semantic-release/github from 11.0.6 to 12.0.6 ([#137](https://github.com/olaoluthomas/timezone-app/issues/137)) ([497c876](https://github.com/olaoluthomas/timezone-app/commit/497c876626ede7051a2d6f7c8ca0295a9e4e6495))
* **deps-dev:** bump the development-dependencies group across 1 directory with 6 updates ([#150](https://github.com/olaoluthomas/timezone-app/issues/150)) ([f637ce3](https://github.com/olaoluthomas/timezone-app/commit/f637ce35cab3a77b0c153550eac70ef8ef413a30))

## [1.6.3](https://github.com/olaoluthomas/timezone-app/compare/v1.6.2...v1.6.3) (2026-05-01)

### Maintenance

* **deps:** bump the production-dependencies group across 1 directory with 2 updates ([#148](https://github.com/olaoluthomas/timezone-app/issues/148)) ([e9a84d5](https://github.com/olaoluthomas/timezone-app/commit/e9a84d583372232259a2bf42b895362d9bbc5fb7))

## [1.6.2](https://github.com/olaoluthomas/timezone-app/compare/v1.6.1...v1.6.2) (2026-05-01)

### Bug Fixes

* upgrade to node:24-alpine and pin npm@11.13 in Dockerfile ([#155](https://github.com/olaoluthomas/timezone-app/issues/155)) ([89dd1ab](https://github.com/olaoluthomas/timezone-app/commit/89dd1ab527468f81eb4e05e5bac695367a07cd22)), closes [#154](https://github.com/olaoluthomas/timezone-app/issues/154)

## [1.6.1](https://github.com/olaoluthomas/timezone-app/compare/v1.6.0...v1.6.1) (2026-04-29)

### Bug Fixes

* differentiate frontend error messages by HTTP status ([#142](https://github.com/olaoluthomas/timezone-app/issues/142)) ([5d1005f](https://github.com/olaoluthomas/timezone-app/commit/5d1005f3ef0b7de93c39911c4a7ab8cdd4765796)), closes [#139](https://github.com/olaoluthomas/timezone-app/issues/139) [#135](https://github.com/olaoluthomas/timezone-app/issues/135)
* make smoke tests resilient to ipapi.co rate limiting ([#141](https://github.com/olaoluthomas/timezone-app/issues/141)) ([#144](https://github.com/olaoluthomas/timezone-app/issues/144)) ([5c26fb9](https://github.com/olaoluthomas/timezone-app/commit/5c26fb94838b37ceefc304866a856955d8ae2d24))

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

### Maintenance

* **deps:** bump express from 4.22.1 to 5.2.1 ([#68](https://github.com/olaoluthomas/timezone-app/issues/68)) ([27c5f55](https://github.com/olaoluthomas/timezone-app/commit/27c5f55e5d1624b816870d5da725053b2f4681ee))

## [1.4.1](https://github.com/olaoluthomas/timezone-app/compare/v1.4.0...v1.4.1) (2026-02-23)

### Bug Fixes

* recalculate currentTime on cache hits for accurate time display ([#126](https://github.com/olaoluthomas/timezone-app/issues/126)) ([a4b471e](https://github.com/olaoluthomas/timezone-app/commit/a4b471e433f714b9c9811dfbdcc7137e878ea6b4)), closes [#107](https://github.com/olaoluthomas/timezone-app/issues/107)

## [1.4.0](https://github.com/olaoluthomas/timezone-app/compare/v1.3.3...v1.4.0) (2026-02-23)

### Features

* **release:** enable CHANGELOG.md generation via semantic-release ([#119](https://github.com/olaoluthomas/timezone-app/issues/119)) ([cb69e6b](https://github.com/olaoluthomas/timezone-app/commit/cb69e6b76e5ee54dbb3201e554e9a873ce62d7ee)), closes [#117](https://github.com/olaoluthomas/timezone-app/issues/117) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#112](https://github.com/olaoluthomas/timezone-app/issues/112)

### Bug Fixes

* **deps:** upgrade semantic-release 24.0.0 → 25.0.3 ([#121](https://github.com/olaoluthomas/timezone-app/issues/121)) ([dd73c3e](https://github.com/olaoluthomas/timezone-app/commit/dd73c3e595172040670bf9da27f814537e8654d7)), closes [#117](https://github.com/olaoluthomas/timezone-app/issues/117) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#118](https://github.com/olaoluthomas/timezone-app/issues/118) [#112](https://github.com/olaoluthomas/timezone-app/issues/112) [#120](https://github.com/olaoluthomas/timezone-app/issues/120)
* **release:** upgrade Node.js to 22.x for semantic-release v25 ([#125](https://github.com/olaoluthomas/timezone-app/issues/125)) ([69122e2](https://github.com/olaoluthomas/timezone-app/commit/69122e25f9d054b202ebda5d9a27e47c296e9a9a)), closes [#124](https://github.com/olaoluthomas/timezone-app/issues/124)

## [1.3.3](https://github.com/olaoluthomas/timezone-app/compare/v1.3.2...v1.3.3) (2026-02-22)

### Bug Fixes

* remove branch prefix from SHA tag in container workflow ([9845086](https://github.com/olaoluthomas/timezone-app/commit/98450861ef79255567dd34b7b96b93906ab2424e))

## [1.3.2](https://github.com/olaoluthomas/timezone-app/compare/v1.3.1...v1.3.2) (2026-02-22)

### Bug Fixes

* add clarifying comment to pre-push CI skip logic ([15d657f](https://github.com/olaoluthomas/timezone-app/commit/15d657fd1d8047882f060913a480daea178eb473))

## [1.3.1](https://github.com/olaoluthomas/timezone-app/compare/v1.3.0...v1.3.1) (2026-02-22)

### Bug Fixes

* trigger container workflow on release events ([986c3d1](https://github.com/olaoluthomas/timezone-app/commit/986c3d1dc50e7a5bba917c1682eb525904278e24))

## [1.3.0](https://github.com/olaoluthomas/timezone-app/compare/v1.2.0...v1.3.0) (2026-02-22)

### Features

* add container workflows and Docker infrastructure (Fixes [#25](https://github.com/olaoluthomas/timezone-app/issues/25)) ([#26](https://github.com/olaoluthomas/timezone-app/issues/26)) ([c078f88](https://github.com/olaoluthomas/timezone-app/commit/c078f882e677a8538cfc771ec7cc02dd494230f5))
* add development fallback for geolocation API (Closes [#14](https://github.com/olaoluthomas/timezone-app/issues/14)) ([#18](https://github.com/olaoluthomas/timezone-app/issues/18)) ([fb5b6ca](https://github.com/olaoluthomas/timezone-app/commit/fb5b6ca5a415da702deff2052fe1193f65665da6))
* add PR issue closing validation system ([#94](https://github.com/olaoluthomas/timezone-app/issues/94)) ([e5cee9a](https://github.com/olaoluthomas/timezone-app/commit/e5cee9addac8aa419d1db59588bbd622ee212c09)), closes [#93](https://github.com/olaoluthomas/timezone-app/issues/93)
* add PR validation workflow to enforce labeling (Fixes [#64](https://github.com/olaoluthomas/timezone-app/issues/64)) ([b0fae6b](https://github.com/olaoluthomas/timezone-app/commit/b0fae6bbe609c18a0bbd8551586acf31e4673ab3))
* implement graceful shutdown for zero-downtime deployments (Fixes [#19](https://github.com/olaoluthomas/timezone-app/issues/19)) ([#20](https://github.com/olaoluthomas/timezone-app/issues/20)) ([01b53da](https://github.com/olaoluthomas/timezone-app/commit/01b53da9beccc99d0e86c8b3dae7742a9d5b8f68))
* integrate semantic-release for automated versioning ([#116](https://github.com/olaoluthomas/timezone-app/issues/116)) ([1a4374f](https://github.com/olaoluthomas/timezone-app/commit/1a4374f6f2dde09a854530e859ad9915877089fd)), closes [#114](https://github.com/olaoluthomas/timezone-app/issues/114)
* optimize CI workflow to exclude documentation changes ([#81](https://github.com/olaoluthomas/timezone-app/issues/81)) ([338b68b](https://github.com/olaoluthomas/timezone-app/commit/338b68b943adb6686ce6198be05c12e9d74f4958)), closes [#80](https://github.com/olaoluthomas/timezone-app/issues/80)
* optimize CI workflows with path filtering and enhanced OCI labels ([#50](https://github.com/olaoluthomas/timezone-app/issues/50)) ([7fb7673](https://github.com/olaoluthomas/timezone-app/commit/7fb7673fe58953ead88c07d635d7a7255d72d8d9)), closes [#49](https://github.com/olaoluthomas/timezone-app/issues/49)

### Bug Fixes

* allow semantic-release to commit to main in CI ([552f0a9](https://github.com/olaoluthomas/timezone-app/commit/552f0a9c80fe8f84b371a5f1e83866e5fd568623))
* fetch parent commit for path filtering in workflow_run ([#92](https://github.com/olaoluthomas/timezone-app/issues/92)) ([6abd709](https://github.com/olaoluthomas/timezone-app/commit/6abd70976279a3cc13db43525dbdb2e8edc4ad93))
* make lint, format, and build checks blocking in CI ([#113](https://github.com/olaoluthomas/timezone-app/issues/113)) ([b618d3f](https://github.com/olaoluthomas/timezone-app/commit/b618d3fe767985dee03d9bd8b92ef316788abf8b)), closes [#109](https://github.com/olaoluthomas/timezone-app/issues/109) [#112](https://github.com/olaoluthomas/timezone-app/issues/112)
* remove git plugin to work with branch protection ([a4ab519](https://github.com/olaoluthomas/timezone-app/commit/a4ab519ca09cd2f46afe28fde50624939234be07))
* resolve CommonJS/ESM incompatibility from ESLint migration ([9a04c7e](https://github.com/olaoluthomas/timezone-app/commit/9a04c7e35204fb9adddee152d9cbfc50a7db902c))
* skip pre-push tests in CI for semantic-release ([9c3bd81](https://github.com/olaoluthomas/timezone-app/commit/9c3bd81581a68c4c24b190c34c088e8b19cfcc26))
* update PR template formatting to match create-pr.sh ([#99](https://github.com/olaoluthomas/timezone-app/issues/99)) ([3e06d18](https://github.com/olaoluthomas/timezone-app/commit/3e06d188815973f1bc54b4ad01b91c5a130d9466)), closes [#98](https://github.com/olaoluthomas/timezone-app/issues/98)

### Code Refactoring

* add request/response logging middleware ([#105](https://github.com/olaoluthomas/timezone-app/issues/105)) ([af75b47](https://github.com/olaoluthomas/timezone-app/commit/af75b4751782f5a66d82ee7287ef05cd6a561970)), closes [#38](https://github.com/olaoluthomas/timezone-app/issues/38)
* centralize configuration management with validation ([#108](https://github.com/olaoluthomas/timezone-app/issues/108)) ([74f26f7](https://github.com/olaoluthomas/timezone-app/commit/74f26f75ef3a83c242b3067a08b974e98b3284e5)), closes [#39](https://github.com/olaoluthomas/timezone-app/issues/39)
* eliminate code duplication in geolocation.js ([#100](https://github.com/olaoluthomas/timezone-app/issues/100)) ([d3efedd](https://github.com/olaoluthomas/timezone-app/commit/d3efedd686e0dd4d46e0fa97c9ec76a9d850c8a6)), closes [#33](https://github.com/olaoluthomas/timezone-app/issues/33)
* extract magic numbers to centralized constants module ([#7](https://github.com/olaoluthomas/timezone-app/issues/7)) ([9af374f](https://github.com/olaoluthomas/timezone-app/commit/9af374ff3dafedd5a4411fbe3e72cc2d7d210c63))
* remove unnecessary Promise.resolve() wrapper (Fixes [#37](https://github.com/olaoluthomas/timezone-app/issues/37)) ([#51](https://github.com/olaoluthomas/timezone-app/issues/51)) ([f644b41](https://github.com/olaoluthomas/timezone-app/commit/f644b417e6576b09e7e76a59bbbdcd6470f8e003))

### Maintenance

* add safeguards to prevent direct commits to main (Fixes [#52](https://github.com/olaoluthomas/timezone-app/issues/52)) ([#53](https://github.com/olaoluthomas/timezone-app/issues/53)) ([6e67d99](https://github.com/olaoluthomas/timezone-app/commit/6e67d996214a41b00f115a3bc58393bde2b11529))
* **deps-dev:** bump @commitlint/cli from 18.6.1 to 20.4.1 ([#24](https://github.com/olaoluthomas/timezone-app/issues/24)) ([aef4ea8](https://github.com/olaoluthomas/timezone-app/commit/aef4ea889ab95d4553d244c97b1b539a5da68fa8))
* **deps-dev:** bump @commitlint/config-conventional ([509507c](https://github.com/olaoluthomas/timezone-app/commit/509507c3582996dd1f042e083b098e56f2e09ac5))
* **deps-dev:** bump jest from 29.7.0 to 30.2.0 ([#23](https://github.com/olaoluthomas/timezone-app/issues/23)) ([2279a31](https://github.com/olaoluthomas/timezone-app/commit/2279a3151841ffb7fc88eefadaa39e404730c1e9))
* **deps-dev:** bump supertest from 6.3.4 to 7.2.2 ([9992789](https://github.com/olaoluthomas/timezone-app/commit/9992789f7159d95d23268fbe36debf12cbb7c7a5))
* **deps-dev:** bump the development-dependencies group with 2 updates ([#22](https://github.com/olaoluthomas/timezone-app/issues/22)) ([9421097](https://github.com/olaoluthomas/timezone-app/commit/942109740635016d08b3c22bdfc0cee2249d3467))
* **deps:** bump axios in the production-dependencies group ([0af9b6e](https://github.com/olaoluthomas/timezone-app/commit/0af9b6ef5afa98c4f6ba36e6020ba2e660931c18))
* **deps:** bump axios in the production-dependencies group ([#21](https://github.com/olaoluthomas/timezone-app/issues/21)) ([f2b7ef0](https://github.com/olaoluthomas/timezone-app/commit/f2b7ef0db8590572262356eeb7adf53244a1b3fc))
* **deps:** bump axios in the production-dependencies group ([#66](https://github.com/olaoluthomas/timezone-app/issues/66)) ([0a0b3c1](https://github.com/olaoluthomas/timezone-app/commit/0a0b3c12523287734093ffd123f9ae89e6ae9085))
* migrate ESLint 8 → 9 with flat config format ([a598155](https://github.com/olaoluthomas/timezone-app/commit/a59815503aae831076e4abe21cfa272ee4b098e6))
* upgrade ESLint to v10.x and resolve 3 security vulnerabilities ([#110](https://github.com/olaoluthomas/timezone-app/issues/110)) ([337a540](https://github.com/olaoluthomas/timezone-app/commit/337a540e92f346527b3c340f3e1658020fd9b847)), closes [#109](https://github.com/olaoluthomas/timezone-app/issues/109)

## [1.2.0](https://github.com/olaoluthomas/timezone-app/compare/v1.1.0...v1.2.0) (2026-01-25)

### Features

* add compression middleware and GitHub Actions CI/CD pipeline ([#6](https://github.com/olaoluthomas/timezone-app/issues/6)) ([700e265](https://github.com/olaoluthomas/timezone-app/commit/700e265fbc96c8b737a0d6b48936132375e63f79))
* add compression middleware for 60-80% payload reduction ([#5](https://github.com/olaoluthomas/timezone-app/issues/5)) ([49c8536](https://github.com/olaoluthomas/timezone-app/commit/49c8536bf909e113286dcb827037cfded6c71bf0))

## [1.1.0](https://github.com/olaoluthomas/timezone-app/compare/23cfe4c68b7a87171b3596c40e7143c7ca07d3df...v1.1.0) (2026-01-25)

### Features

* Implement Winston logger for structured logging ([#4](https://github.com/olaoluthomas/timezone-app/issues/4)) ([20a07b9](https://github.com/olaoluthomas/timezone-app/commit/20a07b9b718c74485d0fdf5f57fe991add19683f)), closes [#1](https://github.com/olaoluthomas/timezone-app/issues/1)

### Bug Fixes

* remove duplicate --coverage flag in run-ci-tests.sh ([#1](https://github.com/olaoluthomas/timezone-app/issues/1)) ([23cfe4c](https://github.com/olaoluthomas/timezone-app/commit/23cfe4c68b7a87171b3596c40e7143c7ca07d3df))
