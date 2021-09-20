/* eslint-disable */

const name = 'nx-setup';
const srcRoot = `packages/${name}`;

module.exports = {
  extends: '../../release.config.base.js',
  pkgRoot: `../../dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    'workspace.json',
    'nx.json',
    '.nxignore',
    'package.json',
    '.prettierrc',
    '.prettierignore',
    `${srcRoot}/*`,
  ],
};
