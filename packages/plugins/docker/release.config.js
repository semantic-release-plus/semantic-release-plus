/* eslint-disable no-undef */
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
