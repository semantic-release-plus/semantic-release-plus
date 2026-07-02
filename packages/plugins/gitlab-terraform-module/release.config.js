/* eslint-disable no-undef */
const name = 'gitlab-terraform-module';
const srcRoot = `packages/plugins/${name}`;
const pathToRepoRoot = '../../..';

module.exports = require(`${pathToRepoRoot}/release.config.base.js`)({
  pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    `*`, // anything in this directory
  ],
});
