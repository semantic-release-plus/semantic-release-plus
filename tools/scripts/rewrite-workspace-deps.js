#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * rewrite-workspace-deps.js
 *
 * WHY THIS EXISTS
 * ---------------
 * Internal cross-package dependencies in this monorepo use pnpm's `workspace:*`
 * protocol in their SOURCE package.json (e.g. srp depends on
 * "@semantic-release-plus/core": "workspace:*"). That protocol makes local
 * builds/tests resolve against the working-tree package instead of a published
 * one — which is exactly what we want for development.
 *
 * The problem is publishing. This repo dogfoods its own release tool: each
 * package is released via `semantic-release-plus` using the default
 * `@semantic-release/npm` plugin, which shells out to plain `npm publish`
 * against `dist/packages/<name>`. Plain npm does NOT understand the
 * `workspace:` protocol (https://github.com/npm/rfcs/issues/765), and the
 * `@nx/js:tsc` build copies the `workspace:*` specifier verbatim into the dist
 * manifest. `pnpm publish`/`pnpm pack` WOULD rewrite it, and `nx release` would
 * too — but neither is on this repo's publish path. So without this step, we
 * would publish manifests whose dependency version is the literal string
 * "workspace:*", which consumers cannot install.
 *
 * We deliberately did NOT switch to `nx release` (that would stop dogfooding
 * semantic-release-plus) and did NOT switch publishing to `pnpm publish` (keeps
 * the semantic-release integration intact). Instead this tiny, explicit rewrite
 * runs as an `@semantic-release/exec` `prepareCmd` — AFTER @semantic-release/npm
 * has written the release version into the dist manifest, and BEFORE publish.
 *
 * WHY GIT TAGS AND NOT `npm view <dep> version`
 * ---------------------------------------------
 * We must NOT resolve internal deps to their npm `latest`. Upstream
 * semantic-release has migrated to ESM; semantic-release-plus has NOT yet
 * (planned, not done). The npm `latest` of these packages is the stale
 * pre-ESM line (e.g. @semantic-release-plus/core latest = 1.0.1) while this
 * repo is releasing the 2.0.0 line. Pinning `latest` would pin the wrong,
 * incompatible major.
 *
 * The correct, self-consistent source is this repo's own release tags. Each
 * package releases with `tagFormat: <dir>-v${version}` (e.g. core-v2.0.0-beta.1),
 * so the version a dependent should pin is the depended package's latest tag ON
 * THE CURRENT RELEASE CHANNEL (a beta release of srp must depend on core's beta,
 * not a stale alpha or a stable).
 *
 * USAGE
 *   node tools/scripts/rewrite-workspace-deps.js <distPackageJsonPath>
 * Invoked per-package from release.config.base.js prepareCmd with the package's
 * pkgRoot dist manifest.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const semver = require('semver');

const repoRoot = path.resolve(__dirname, '..', '..');

/**
 * Build a map of published-package-name -> release-tag-prefix by reading every
 * workspace package.json. The tag prefix is the package's DIRECTORY name (that's
 * what tagFormat uses), which is not derivable from the npm name
 * (e.g. name "semantic-release-plus" lives in dir "srp" -> tag "srp-v*").
 */
function buildNameToTagPrefixMap() {
  const map = {};
  const dirs = [
    ...listPackageDirs(path.join(repoRoot, 'packages')),
    ...listPackageDirs(path.join(repoRoot, 'packages', 'plugins')),
  ];
  for (const dir of dirs) {
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const { name } = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (name) map[name] = path.basename(dir);
  }
  return map;
}

function listPackageDirs(parent) {
  if (!fs.existsSync(parent)) return [];
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() && e.name !== 'plugins' && e.name !== 'node_modules',
    )
    .map((e) => path.join(parent, e.name));
}

/**
 * Determine the release channel from the branch semantic-release is releasing
 * on. semantic-release runs per branch; we read the branch from the common CI
 * env vars, falling back to the current git branch for local runs.
 * - beta / alpha branches -> prerelease channel of the same name
 * - anything else (master, maintenance) -> stable (no prerelease suffix)
 */
function currentChannel() {
  const ref =
    process.env.GITHUB_REF_NAME ||
    process.env.BRANCH_NAME ||
    process.env.GITHUB_REF ||
    safeGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  const branch = (ref || '').replace(/^refs\/heads\//, '').trim();
  if (branch === 'beta') return 'beta';
  if (branch === 'alpha') return 'alpha';
  return 'stable';
}

/**
 * Latest version for a package's tag prefix on the given channel.
 * Tags look like `<prefix>-v<semver>` (e.g. core-v2.0.0-beta.1).
 * - stable channel: only tags with NO prerelease component
 * - beta/alpha channel: only tags whose prerelease id matches the channel
 * Returns the highest matching semver, or null if none.
 */
function latestTagVersion(tagPrefix, channel) {
  const raw = safeGit(['tag', '-l', `${tagPrefix}-v*`]);
  if (!raw) return null;
  const versions = raw
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.slice(`${tagPrefix}-v`.length))
    .filter((v) => semver.valid(v))
    .filter((v) => {
      const pre = semver.prerelease(v); // e.g. ['beta', 1] or null
      if (channel === 'stable') return pre === null;
      return pre !== null && pre[0] === channel;
    })
    .sort(semver.rcompare);
  return versions[0] || null;
}

// Runs git with an argument array via execFileSync — no shell, so the `*` glob
// in tag patterns is passed to git literally (git does its own matching) and
// arguments cannot be shell-injected.
function safeGit(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error(
      'rewrite-workspace-deps: missing dist package.json path argument',
    );
    process.exit(1);
  }
  const absManifest = path.resolve(manifestPath, 'package.json');
  const target = fs.existsSync(absManifest)
    ? absManifest
    : path.resolve(manifestPath);
  if (!fs.existsSync(target)) {
    console.error(`rewrite-workspace-deps: manifest not found at ${target}`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(target, 'utf8'));
  const nameToTagPrefix = buildNameToTagPrefixMap();
  const channel = currentChannel();

  let rewrote = 0;
  for (const depType of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const deps = pkg[depType];
    if (!deps) continue;
    for (const [depName, spec] of Object.entries(deps)) {
      if (typeof spec !== 'string' || !spec.startsWith('workspace:')) continue;

      const tagPrefix = nameToTagPrefix[depName];
      if (!tagPrefix) {
        // A workspace:* dep that isn't a known workspace package is a real
        // misconfiguration — fail loudly rather than publish a broken manifest.
        console.error(
          `rewrite-workspace-deps: ${depName} uses workspace: but is not a known workspace package`,
        );
        process.exit(1);
      }

      const version = latestTagVersion(tagPrefix, channel);
      if (!version) {
        console.error(
          `rewrite-workspace-deps: no ${channel} release tag found for ${depName} ` +
            `(prefix "${tagPrefix}-v"). Cannot resolve a publishable version for its ` +
            `workspace: dependency in ${pkg.name}. Ensure ${depName} has been released ` +
            `on the ${channel} channel before releasing dependents.`,
        );
        process.exit(1);
      }

      // Pin as a caret range so patch/minor updates of the internal dep on the
      // same channel remain compatible for consumers, matching how a normal
      // npm consumer would depend on these packages.
      deps[depName] = `^${version}`;
      console.log(
        `rewrite-workspace-deps: ${pkg.name} ${depType}.${depName}: workspace:* -> ^${version} (${channel})`,
      );
      rewrote++;
    }
  }

  if (rewrote > 0) {
    fs.writeFileSync(target, JSON.stringify(pkg, null, 2) + '\n');
  } else {
    console.log(
      `rewrite-workspace-deps: no workspace: specifiers in ${pkg.name}, nothing to do`,
    );
  }
}

main();
