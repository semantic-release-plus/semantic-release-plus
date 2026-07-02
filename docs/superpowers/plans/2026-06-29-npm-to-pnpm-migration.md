# npm → pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the semantic-release-plus Nx monorepo from npm to pnpm with pnpm workspaces, `workspace:*` inter-package deps, corepack-pinned pnpm, and Node 22 baseline.

**Architecture:** Keep Nx 22.5.2 as the task runner/graph layer untouched. Add a pnpm workspace over `packages/*`, replace volta with corepack for package-manager pinning, swap all `npm`/`npx` invocations for pnpm, and convert the three internal cross-package specifiers from the `alpha` dist-tag to `workspace:*`. Strict pnpm `node_modules` (no hoisting); declare any phantom deps surfaced by builds/tests.

**Tech Stack:** pnpm 11.x (corepack), Node 22 (>=22.13), Nx 22.5.2, Husky 7, GitHub Actions, Verdaccio (e2e), semantic-release.

## Global Constraints

- Node baseline: `engines.node` MUST be `>=22.13` (pnpm 11 requirement).
- Package manager pinned via `packageManager: "pnpm@11.9.0"` in root `package.json`; corepack enforces it. Do NOT add a `pnpm` engines constraint.
- `node_modules` linking: pnpm **strict default** — no `node-linker=hoisted`. Fix phantom-dep failures by declaring the missing dependency, never by hoisting.
- Nx stays at **22.5.2**. Do not bump Nx unless a concrete pnpm-driven failure during verification forces it (record the failure if so).
- Internal package names: `@semantic-release-plus/core` (dir `core`), `semantic-release-plus` (dir `srp`), `@semantic-release-plus/nx-tools` (dir `nx-tools`), `@semantic-release-plus/error` (dir `error`), `commitmatic` (dir `commitmatic`).
- Use `pnpm exec nx …` (not `npx nx …`) for all Nx invocations.
- Publishing stays on `@semantic-release/npm`. `workspace:*` MUST be rewritten to a concrete published range on publish — validated by Verdaccio e2e locally (CI e2e remains disabled, out of scope to re-enable).
- Commit after each task. Branch: `chore/migrate-npm-to-pnpm`.

## File Structure

- `package.json` (root) — remove `volta`, bump `engines.node`, add `packageManager`, fix `XXXpostinstall` script.
- `pnpm-workspace.yaml` (new) — declares `packages/*`.
- `.nvmrc` (new) — `22`, read by `actions/setup-node` and fnm.
- `package-lock.json` — **deleted**.
- `pnpm-lock.yaml` (new, generated).
- `packages/srp/package.json` — `@semantic-release-plus/core: workspace:*`.
- `packages/nx-tools/package.json` — `@semantic-release-plus/core` + `semantic-release-plus` → `workspace:*`.
- `.husky/pre-commit` — `pnpm exec lint-staged`.
- `.github/workflows/main.yml` — corepack + pnpm install + `pnpm exec nx` + store cache (both jobs).
- `README.md` — corepack/fnm/pnpm install docs.

---

### Task 1: Pin pnpm via corepack, bump Node baseline, drop volta

**Files:**

- Modify: `package.json` (root) — `volta`, `engines`, add `packageManager`, fix `XXXpostinstall`
- Create: `.nvmrc`

**Interfaces:**

- Consumes: nothing (first task)
- Produces: `packageManager: "pnpm@11.9.0"` and `engines.node: ">=22.13"` that all later tasks and corepack rely on; `.nvmrc` containing `22`.

- [ ] **Step 1: Confirm latest pnpm version to pin**

Run: `npm view pnpm version`
Expected: prints a `11.x` version (e.g. `11.9.0`). Use that exact value as `<PNPM_VERSION>` below. If it differs from `11.9.0`, substitute it everywhere in this plan.

- [ ] **Step 2: Edit root `package.json`**

Remove the `volta` block entirely:

```json
  "volta": {
    "node": "20.8.1"
  },
```

Change `engines`:

```json
  "engines": {
    "node": ">=22.13"
  },
```

Add a `packageManager` field at the top level (sibling of `engines`):

```json
  "packageManager": "pnpm@11.9.0",
```

Fix the postinstall script (currently `"XXXpostinstall": "npm run register-local-nx-plugins"`):

```json
    "XXXpostinstall": "pnpm run register-local-nx-plugins",
```

- [ ] **Step 3: Create `.nvmrc`**

```
22
```

- [ ] **Step 4: Verify package.json is valid JSON and values are set**

Run: `node -e "const p=require('./package.json'); if(p.volta) throw new Error('volta still present'); if(p.engines.node!=='>=22.13') throw new Error('engines wrong'); if(!/^pnpm@11\./.test(p.packageManager)) throw new Error('packageManager wrong'); if(p.scripts.XXXpostinstall.includes('npm ')) throw new Error('script still npm'); console.log('OK', p.packageManager, p.engines.node)"`
Expected: `OK pnpm@11.9.0 >=22.13`

- [ ] **Step 5: Commit**

```bash
git add package.json .nvmrc
git commit -m "chore: pin pnpm via corepack, bump node to 22, drop volta"
```

---

### Task 2: Add pnpm workspace and generate the lockfile

**Files:**

- Create: `pnpm-workspace.yaml`
- Create: `pnpm-lock.yaml` (generated)
- Delete: `package-lock.json`

**Interfaces:**

- Consumes: `packageManager`/`engines` from Task 1.
- Produces: a working `pnpm-lock.yaml` and pnpm-managed `node_modules` that all build/test tasks rely on.

- [ ] **Step 1: Enable corepack and activate the pinned pnpm**

Run: `corepack enable && corepack prepare pnpm@11.9.0 --activate && pnpm --version`
Expected: prints `11.9.0` (the pinned version).

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: Seed the lockfile from the existing npm lockfile**

Run: `pnpm import`
Expected: creates `pnpm-lock.yaml` from `package-lock.json` without error.

- [ ] **Step 4: Remove npm artifacts and do a clean pnpm install**

Run: `rm -rf node_modules package-lock.json && pnpm install`
Expected: install completes; `pnpm-lock.yaml` is updated; no `ERR_PNPM` failures. Peer-dependency warnings are acceptable at this step.

- [ ] **Step 5: Verify pnpm recognizes the workspace projects**

Run: `pnpm -r exec node -e "console.log(require('./package.json').name)"`
Expected: prints the 5 internal package names (`commitmatic`, `@semantic-release-plus/core`, `@semantic-release-plus/error`, `@semantic-release-plus/nx-tools`, `semantic-release-plus`), one per project.

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml
git rm --cached package-lock.json
git commit -m "chore: add pnpm workspace and lockfile, remove package-lock.json"
```

---

### Task 3: Convert internal dependencies to the workspace protocol

**Files:**

- Modify: `packages/srp/package.json` — `@semantic-release-plus/core`
- Modify: `packages/nx-tools/package.json` — `@semantic-release-plus/core`, `semantic-release-plus`
- Modify: `pnpm-lock.yaml` (regenerated)

**Interfaces:**

- Consumes: pnpm workspace from Task 2.
- Produces: internal deps resolved from the working tree via `workspace:*` (relied on by build/test and the publish-rewrite validation in Task 7).

- [ ] **Step 1: Edit `packages/srp/package.json`**

Change the internal dep specifier:

```json
    "@semantic-release-plus/core": "workspace:*",
```

(was `"@semantic-release-plus/core": "alpha"`)

- [ ] **Step 2: Edit `packages/nx-tools/package.json`**

Change both internal dep specifiers:

```json
  "dependencies": {
    "@semantic-release-plus/core": "workspace:*",
    "semantic-release-plus": "workspace:*"
  }
```

(both were `"alpha"`)

- [ ] **Step 3: Re-install so pnpm links workspace packages locally**

Run: `pnpm install`
Expected: completes; `node_modules/@semantic-release-plus/core` and `node_modules/semantic-release-plus` inside the consuming packages are symlinks into the workspace.

- [ ] **Step 4: Verify workspace links resolve to the local source**

Run: `node -e "const fs=require('fs'); const p=fs.realpathSync('packages/nx-tools/node_modules/@semantic-release-plus/core'); if(!p.includes('packages/core')) throw new Error('not linked to workspace: '+p); console.log('linked ->', p)"`
Expected: `linked -> …/packages/core`

- [ ] **Step 5: Commit**

```bash
git add packages/srp/package.json packages/nx-tools/package.json pnpm-lock.yaml
git commit -m "chore: use workspace:* for internal package dependencies"
```

---

### Task 4: Verify the full build/test/lint suite under pnpm

This task is the phantom-dependency gate. No source files change unless a strict-linking failure surfaces, in which case the fix is declaring the missing dep.

**Files:**

- Modify (only if needed): the `package.json` of whichever package reports a missing dependency.

**Interfaces:**

- Consumes: everything from Tasks 1–3.
- Produces: a green build/test/lint baseline on pnpm — the precondition for the CI and publish tasks.

- [ ] **Step 1: Build all projects (production)**

Run: `pnpm exec nx run-many --target=build --configuration=production`
Expected: all projects build successfully. If a `Cannot find module 'X'` error appears, that is a phantom dep — go to Step 2; otherwise skip to Step 3.

- [ ] **Step 2: (Only if a build/test/lint step fails on a missing module) Declare the phantom dependency**

Identify the failing package and the missing module `X` from the error. Add `X` to that package's `package.json` `dependencies` (or `devDependencies` if only used in tests/build) at the version already present in the root `pnpm-lock.yaml`:

Run (to find the resolved version): `pnpm why X`

Add the dep to the correct `packages/<pkg>/package.json`, then:
Run: `pnpm install`
Then re-run the failing command. Repeat until it passes.

- [ ] **Step 3: Lint all projects**

Run: `pnpm exec nx run-many --target=lint`
Expected: PASS for all projects (apply Step 2 if a missing-module error appears).

- [ ] **Step 4: Run Jest tests**

Run: `pnpm exec nx run-many --target=test`
Expected: PASS for all projects.

- [ ] **Step 5: Run ava tests**

Run: `pnpm exec nx run-many --target=ava`
Expected: PASS for all projects.

- [ ] **Step 6: Commit (only if Step 2 added any deps)**

```bash
git add packages/*/package.json pnpm-lock.yaml
git commit -m "fix: declare dependencies surfaced by pnpm strict linking"
```

If no files changed, skip the commit and note "no phantom deps surfaced" in the task review.

---

### Task 5: Update Husky hook and sweep remaining npm/npx references

**Files:**

- Modify: `.husky/pre-commit`
- Modify (if any hits): repo config files containing `npm `/`npx `

**Interfaces:**

- Consumes: pnpm baseline from Task 4.
- Produces: a pre-commit hook that runs under pnpm; no stray npm/npx invocations in tooling.

- [ ] **Step 1: Edit `.husky/pre-commit`**

Replace the lint-staged line:

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm exec lint-staged --relative
```

(was `npx lint-staged --relative`)

- [ ] **Step 2: Sweep for remaining npm/npx references in tooling**

Run: `grep -rn --include='*.json' --include='*.yml' --include='*.yaml' --include='*.sh' --include='*.js' -E '\b(npm ci|npm run|npm install|npm i |npx )' . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=tmp --exclude-dir=.git`
Expected: the only remaining hits should be inside `packages/srp/` test helpers/docs that intentionally exercise the npm registry/publish flow (e.g. `npm-registry.js`, FAQ docs) and `.github/workflows/main.yml` (handled in Task 6). Convert any _tooling_ hits (build scripts, hooks) to pnpm; leave test fixtures that deliberately test npm publishing untouched.

- [ ] **Step 3: Verify the hook runs under pnpm**

Run: `touch README.md && git add README.md && pnpm exec lint-staged --relative; git restore --staged README.md`
Expected: lint-staged runs to completion (SUCCESS), proving the hook command works.

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-commit
git commit -m "chore: run lint-staged via pnpm in pre-commit hook"
```

---

### Task 6: Migrate GitHub Actions CI to pnpm + corepack

**Files:**

- Modify: `.github/workflows/main.yml` (both `main` and `agents` jobs)

**Interfaces:**

- Consumes: `.nvmrc`, `pnpm-lock.yaml`, `packageManager` field.
- Produces: CI that installs via pnpm with store caching and runs Nx via `pnpm exec`.

- [ ] **Step 1: Replace volta + npm in the `main` job**

In the `main` job, replace the volta step:

```yaml
- uses: volta-cli/action@v4
  with:
    package-json-path: '${{ github.workspace }}/package.json'
```

with setup-node + corepack + pnpm store cache:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
- name: Enable corepack
  run: corepack enable
- name: Get pnpm store directory
  id: pnpm-store
  run: echo "path=$(pnpm store path --silent)" >> "$GITHUB_OUTPUT"
- uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-store.outputs.path }}
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

Replace the install:

```yaml
- run: pnpm install --frozen-lockfile --ignore-scripts
```

(was `npm ci --ignore-scripts`)

Replace every `npx ` with `pnpm exec ` in the `main` job's run steps:

```yaml
- run: pnpm exec nx-cloud start-ci-run
- name: '📝 Lint'
  run: pnpm exec nx affected --target=lint --parallel --max-parallel=3
- name: '🧪 Test'
  run: pnpm exec nx affected --target=test --codeCoverage --parallel --max-parallel=3
- name: '🧪 Test ava'
  run: pnpm exec nx affected --target=ava --parallel --max-parallel=3
- name: '🏗️ Build'
  run: pnpm exec nx affected --target=build --configuration=production --parallel --max-parallel=3
- name: '📦 Release'
  run: NX_CLOUD_DISTRIBUTED_EXECUTION=false pnpm exec nx affected --target=release
- run: pnpm exec nx-cloud stop-all-agents
```

(Leave the commented-out E2E line as-is — out of scope.)

- [ ] **Step 2: Replace volta + npm in the `agents` job**

Replace the volta step (same block as Step 1) with setup-node + corepack (the store cache is optional on agents; include the setup-node + `corepack enable` at minimum):

```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
- name: Enable corepack
  run: corepack enable
```

Replace install and start-agent:

```yaml
- run: pnpm install --frozen-lockfile --ignore-scripts
- name: Start Nx Agent ${{ matrix.agent }}
  run: pnpm exec nx-cloud start-agent
```

- [ ] **Step 3: Validate the workflow YAML parses and contains no npm/volta**

Run: `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/main.yml')); raw=open('.github/workflows/main.yml').read(); assert 'volta' not in raw, 'volta still referenced'; assert 'npm ci' not in raw, 'npm ci still referenced'; print('workflow OK, jobs:', list(d['jobs']))"`
Expected: `workflow OK, jobs: ['main', 'agents']`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/main.yml
git commit -m "ci: migrate workflow from npm/volta to pnpm/corepack"
```

---

### Task 7: Validate the publish path (workspace:\* rewrite) via Verdaccio e2e

**Files:**

- None modified (validation only). If a publish-rewrite failure surfaces, the fix is recorded and may require a follow-up decision.

**Interfaces:**

- Consumes: `workspace:*` deps from Task 3, green build from Task 4.
- Produces: evidence that `workspace:*` is rewritten to a concrete published range on publish.

- [ ] **Step 1: Build the packages to be published**

Run: `pnpm exec nx run-many --target=build --configuration=production`
Expected: PASS (prerequisite for packing/publishing).

- [ ] **Step 2: Inspect what pnpm pack produces for a workspace-protocol package**

Run: `cd packages/nx-tools && pnpm pack --pack-destination /tmp && cd -`
Then inspect the packed manifest:
Run: `tar -xzf /tmp/*nx-tools*.tgz -C /tmp/srp-pack --one-top-level 2>/dev/null; node -e "const p=require('/tmp/srp-pack/package/package.json'); const d={...p.dependencies}; for(const [k,v] of Object.entries(d)){ if(String(v).startsWith('workspace:')) throw new Error('workspace: not rewritten for '+k+' -> '+v); } console.log('rewritten deps:', JSON.stringify(d))"`
Expected: no `workspace:` specifiers remain in the packed manifest; internal deps show a concrete version range. If `workspace:` remains, the publish path is broken — stop and surface this (do not publish).

- [ ] **Step 3: Run the Verdaccio-backed srp e2e (publish flow)**

Run: `pnpm exec nx run srp:ava` (or the project's e2e/test target that uses `packages/srp/test/helpers/npm-registry.js`)
Expected: PASS — confirms publishing against the local Verdaccio registry works under pnpm.

- [ ] **Step 4: Record evidence**

Capture the `rewritten deps:` output from Step 2 and the e2e pass in the task review notes. No commit (validation-only task) unless Step 2/3 required a fix.

---

### Task 8: Update documentation for the pnpm workflow

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: the completed migration.
- Produces: contributor-facing setup instructions for corepack + fnm + pnpm.

- [ ] **Step 1: Add a "Local development setup" section to `README.md`**

Insert (near the top, after the badges/intro) a section documenting the toolchain:

````markdown
## Local development setup

This repo uses **pnpm** (pinned via [corepack](https://nodejs.org/api/corepack.html)) and **Node 22**.

1. Use Node 22 (the `.nvmrc` pins it). With [fnm](https://github.com/Schniz/fnm): `fnm use` (or `fnm install` first).
2. Enable corepack so the pinned pnpm version is used automatically:
   ```bash
   corepack enable
   ```
````

3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Common tasks (Nx via pnpm):
   ```bash
   pnpm exec nx run-many --target=build
   pnpm exec nx run-many --target=test
   ```

````

- [ ] **Step 2: Verify the README has no stale npm install instructions**

Run: `grep -nE '\bnpm (install|ci|run)\b|\bnpx \b' README.md || echo "no stale npm refs"`
Expected: `no stale npm refs` (or only intentional mentions inside code-publishing examples).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document pnpm/corepack/fnm local setup"
````

---

## Self-Review

**Spec coverage:**

- §1 corepack/volta/Node bump → Task 1 ✅
- §2 workspace + lockfile → Task 2 ✅; `workspace:*` conversion → Task 3 ✅
- §3 script/husky/docs sweep → Tasks 1 (postinstall), 5 (husky + sweep), 8 (README) ✅
- §4 CI → Task 6 ✅
- §5 publish-path validation → Task 7 ✅
- §6 verification → Task 4 (build/lint/test/ava) + Task 7 (e2e/publish) ✅
- Nx unchanged constraint → Global Constraints ✅
- Strict-linking phantom-dep policy → Task 4 Step 2 ✅

**Placeholder scan:** `<PNPM_VERSION>` is resolved in Task 1 Step 1 to a concrete value and substituted; not a placeholder left in code. No TBD/TODO. ✅

**Type/name consistency:** Package names match the Global Constraints list across Tasks 2, 3, 7. `pnpm exec nx` used consistently. `workspace:*` spelled consistently. ✅
