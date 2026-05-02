import { ConventionalChangelog } from 'conventional-changelog';
import preset from 'conventional-changelog-conventionalcommits';
import { writeFileSync } from 'fs';

const types = [
  { type: 'feat',     section: 'Features',                 hidden: false },
  { type: 'fix',      section: 'Bug Fixes',                hidden: false },
  { type: 'perf',     section: 'Performance Improvements', hidden: false },
  { type: 'refactor', section: 'Code Refactoring',         hidden: false },
  { type: 'chore',    section: 'Maintenance',              hidden: false },
  { type: 'test',     section: 'Tests',                    hidden: true  },
  { type: 'docs',     section: 'Documentation',            hidden: true  },
  { type: 'ci',       section: 'CI',                       hidden: true  },
  { type: 'build',    section: 'Build',                    hidden: true  },
  { type: 'style',    section: 'Style',                    hidden: true  },
];

const config = await preset({ types });
const cc = new ConventionalChangelog();
cc.readPackage().config(config).options({ releaseCount: 0, tagPrefix: 'v' });

// Use transformCommits to filter out chore(release) auto-commits
cc.transformCommits((commits) =>
  commits.filter(c => !(c.type === 'chore' && c.scope === 'release'))
);

const chunks = [];
for await (const chunk of cc.write()) chunks.push(chunk);

// Manually prepend v1.7.2 (generator skips it because HEAD is one commit past the tag)
const v172 = `
## [1.7.2](https://github.com/olaoluthomas/timezone-app/compare/v1.7.1...v1.7.2) (2026-05-02)

### Maintenance

* **deps:** upgrade nock to v14 ([#173](https://github.com/olaoluthomas/timezone-app/issues/173)) ([2c1d2d5](https://github.com/olaoluthomas/timezone-app/commit/2c1d2d5eae329be9ce78a3f1d7a2a1ebabb1792c)), closes [#32](https://github.com/olaoluthomas/timezone-app/issues/32)

`;

writeFileSync('CHANGELOG.md', v172 + chunks.join(''));
console.log('Done');
