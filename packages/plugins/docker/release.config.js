/* eslint-disable no-undef */
// npx semantic-release --no-ci --branch=mono-repo-scripts --extends=./apps/member-portal-webui/release.config.js --debug
const name = 'docker';
const srcRoot = `packages/plugins/${name}`;
const pathToRepoRoot = '../../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.js`,
  pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    // REMOVING external dependencies to decrease unneeded releases and bad change logs
    `*`, // anything in this directory
    `${pathToRepoRoot}/packages/core`,
  ],
};
