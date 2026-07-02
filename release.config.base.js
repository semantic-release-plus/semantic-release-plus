/* eslint-disable no-undef */
const path = require('path');

// Absolute path to the workspace-dependency rewrite script (see that file's
// header for the full rationale). Resolved from this config's location so it
// works regardless of the cwd semantic-release runs each package from.
const rewriteScript = path.join(
  __dirname,
  'tools',
  'scripts',
  'rewrite-workspace-deps.js',
);

/**
 * Build the shared release config for a package.
 *
 * Each package's release.config.js calls this with its own settings (name,
 * pkgRoot, tagFormat, commitPaths). We take the config as a function rather than
 * a plain object so the `@semantic-release/exec` rewrite step can be wired to
 * the caller's exact `pkgRoot` — no fragile lodash template guessing at the
 * dist path.
 *
 * WHY THE EXEC STEP EXISTS
 * ------------------------
 * Internal deps use pnpm's `workspace:*` protocol in source. The @nx/js:tsc
 * build copies that specifier verbatim into dist/packages/<name>/package.json,
 * and this repo publishes via @semantic-release/npm -> `npm publish`, which
 * cannot resolve the `workspace:` protocol. Without a rewrite we would publish
 * uninstallable manifests. `pnpm publish` / `nx release` would rewrite it, but
 * neither is on this repo's publish path (we intentionally keep dogfooding
 * semantic-release-plus's own release flow).
 *
 * We list plugins explicitly (previously relied on the implicit default set) so
 * the exec step lands in the right place in the prepare lifecycle: AFTER
 * @semantic-release/npm's prepare (which writes the release version into the
 * dist manifest) and BEFORE publish. See tools/scripts/rewrite-workspace-deps.js
 * for how versions are resolved (channel-aware git tags, NOT npm `latest`).
 */
module.exports = function createReleaseConfig({
  pkgRoot,
  tagFormat,
  commitPaths,
} = {}) {
  return {
    pkgRoot,
    tagFormat,
    commitPaths,
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/npm',
      [
        '@semantic-release/exec',
        {
          // pkgRoot is this package's dist dir. Rewrite its manifest after npm's
          // prepare set the version and before publish reads it.
          prepareCmd: `node ${rewriteScript} ${pkgRoot}`,
        },
      ],
      '@semantic-release/github',
    ],
  };
};
