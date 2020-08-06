/* eslint-disable no-undef */
// npx semantic-release --no-ci --branch=mono-repo-scripts --extends=./apps/member-portal-webui/release.config.js --debug
const name = 'docker';
const srcRoot = `packages/plugins/${name}`;

module.exports = {
  pkgRoot: `dist/${srcRoot}`, // should come from angular.cli
  tagFormat: name + '-v${version}',
  commitPaths: [
    'workspace.json',
    'nx.json',
    '.nxignore',
    'package.json',
    '.prettierrc',
    '.prettierignore',
    `${srcRoot}/*`,
  ], // should come from dep-graph and angular.json
  // assets: [`${srcRoot}/README.md`, `${srcRoot}/CHANGELOG.md`],
  // plugins: [
  //   '@semantic-release/commit-analyzer',
  //   '@semantic-release/release-notes-generator',
  //   [
  //     '@semantic-release/changelog',
  //     {
  //       changelogFile: `${srcRoot}/CHANGELOG.md`,
  //     },
  //   ],
  //   '@semantic-release/npm',
  //   [
  //     '@semantic-release/git',
  //     {
  //       message:
  //         `chore(release): ${name}` +
  //         '-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
  //     },
  //   ],
  // ],
};
