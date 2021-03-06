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
};
