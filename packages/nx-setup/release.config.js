/* eslint-disable */

const name = 'nx-setup';
const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.js`,
  pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    `${pathToRepoRoot}/workspace.json`,
    `${pathToRepoRoot}/nx.json`,
    `${pathToRepoRoot}/.nxignore`,
    `${pathToRepoRoot}/package.json`,
    `${pathToRepoRoot}/.prettierrc`,
    `${pathToRepoRoot}/.prettierignore`,
    `*`, // anything in this directory
  ],
};
