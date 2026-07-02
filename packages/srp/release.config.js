/* eslint-disable no-undef */
const name = 'srp';
const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

// The base config is a factory that wires the shared plugin list (including the
// workspace:* -> version rewrite exec step) around this package's pkgRoot.
module.exports = require(`${pathToRepoRoot}/release.config.base.js`)({
  pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    // REMOVING external dependencies to decrease unneeded releases and bad change logs
    `*`, // anything in this directory
    `${pathToRepoRoot}/packages/core`,
  ],
});
