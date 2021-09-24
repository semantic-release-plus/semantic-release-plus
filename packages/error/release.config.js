/* eslint-disable no-undef */
// npx semantic-release --no-ci --branch=mono-repo-scripts --extends=./apps/member-portal-webui/release.config.js --debug
const name = 'error';
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
