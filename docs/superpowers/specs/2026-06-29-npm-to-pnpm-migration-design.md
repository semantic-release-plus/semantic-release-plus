# Design: Migrate semantic-release-plus from npm to pnpm

**Date:** 2026-06-29
**Branch:** `chore/migrate-npm-to-pnpm` (from `beta`)
**Status:** Approved design — pending spec review

## Motivation

- **Faster installs / disk savings** — pnpm's content-addressable store + hardlinks.
- **Better monorepo workspaces** — formalize `packages/*` as a pnpm workspace and use the
  `workspace:*` protocol for inter-package dependencies (currently resolved from the registry
  via the `alpha` dist-tag).

## Context (current state)

- **Nx monorepo**, `workspaceLayout.appsDir/libsDir = packages`. Nx 22.5.2 owns the project
  graph and task running. npm workspaces are **not** declared.
- Package manager pinned with **volta** (`node 20.8.1`), `engines.node: ">=20.8.1"`.
- CI (`.github/workflows/main.yml`) uses `volta-cli/action@v4` + `npm ci --ignore-scripts`
  (×3: main job + 3-agent Nx Cloud DTE matrix) and `npx nx …`.
- Publishing via `@semantic-release/npm` (shells out to `npm publish` internally).
- Verdaccio-based e2e in `packages/srp/test/helpers/` (`npm-registry.js`, `config.yaml`).
  **e2e is currently commented out in CI** (`main.yml` lines 47–48).
- Internal dependency graph (specifiers currently `"alpha"`, resolved from registry):
  - `@semantic-release-plus/core` — leaf, no internal deps
  - `semantic-release-plus` (pkg dir `srp`) → `@semantic-release-plus/core`
  - `@semantic-release-plus/nx-tools` → `@semantic-release-plus/core`, `semantic-release-plus`
  - `@semantic-release-plus/error`, `commitmatic` — no internal deps

## Key decisions

| Decision                     | Choice                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Scope                        | **Full migration** in one branch/PR (lockfile, workspace, scripts, CI, husky, docs, verify)                                     |
| node_modules linking         | **Strict pnpm default** — no `node-linker` override; fix phantom-dep fallout by declaring missing deps                          |
| Package-manager pinning      | **corepack** via `packageManager` field; **drop volta**                                                                         |
| Node version manager (local) | **fnm** — documented in README only, not enforced (corepack handles pnpm)                                                       |
| Inter-package protocol       | **Adopt `workspace:*`** for the 3 internal cross-refs                                                                           |
| Node baseline                | **Bump `engines.node` to `>=22.13`**, pin **pnpm@11.x** via corepack                                                            |
| Nx version                   | **No change — stays 22.5.2** (native pnpm support). Revisit only if a concrete pnpm-driven failure appears during verification. |

## Design

### 1. Package-manager pinning: volta → corepack

- Remove the `volta` block from root `package.json`.
- Add `"packageManager": "pnpm@11.9.0"` (corepack reads this; pin the exact latest at
  implementation time).
- Update `"engines"` to `{ "node": ">=22.13" }`. (Do not add a `pnpm` engines constraint —
  the `packageManager` field is the source of truth for pnpm version; corepack enforces it.)
- Add `.nvmrc`/fnm pointer (e.g. `22`) for local Node selection; document fnm in README.

### 2. Workspace + lockfile

- New `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'packages/*'
  ```
- Run `pnpm import` (to seed from `package-lock.json`) then `pnpm install` to generate
  `pnpm-lock.yaml`. **Delete `package-lock.json`.**
- Convert internal specifiers to `workspace:*`:
  - `srp/package.json`: `@semantic-release-plus/core` → `workspace:*`
  - `nx-tools/package.json`: `@semantic-release-plus/core` → `workspace:*`,
    `semantic-release-plus` → `workspace:*`

### 3. Script / reference sweep

- Root `package.json` scripts: `XXXpostinstall` (`npm run …`) → `pnpm run …`.
- `.husky/pre-commit`: `npx lint-staged --relative` → `pnpm exec lint-staged --relative`.
- README + docs install/usage instructions → pnpm (`pnpm install`, `pnpm exec nx …`).
- Sweep for any remaining `npm `/`npx ` references in repo config and fix.

### 4. CI (`.github/workflows/main.yml`)

For **both** the `main` job and the `agents` matrix:

- Replace `volta-cli/action@v4` with `actions/setup-node@v4` (Node 22) + `corepack enable`.
- Replace `npm ci --ignore-scripts` with `pnpm install --frozen-lockfile --ignore-scripts`.
- Replace `npx nx …` with `pnpm exec nx …`.
- Add pnpm store caching via `actions/cache` keyed on `pnpm-lock.yaml` (path from
  `pnpm store path`).
- Ensure `corepack enable` + install runs before `nx-cloud start-agent` on agents.

### 5. Publish-path validation (highest risk)

- `@semantic-release/npm` stays; publishing remains npm under the hood.
- On publish, `workspace:*` specifiers **must** be rewritten to concrete published versions.
  The **Verdaccio e2e** is the gate for this. Because e2e is disabled in CI, this validation
  is performed **locally** during verification.

### 6. Verification (evidence required before claiming done)

Run locally, in order, capturing output:

1. `pnpm install` (clean — remove `node_modules`, `package-lock.json` first)
2. `pnpm exec nx run-many --target=build --configuration=production`
3. `pnpm exec nx run-many --target=lint`
4. `pnpm exec nx run-many --target=test`
5. `pnpm exec nx run-many --target=ava`
6. Verdaccio e2e — confirm publish succeeds and `workspace:*` is rewritten to a valid
   registry range in the published `package.json`.

Phantom-dependency failures from strict linking are resolved by adding the missing dep to the
relevant `package.json` (not by switching to hoisted linking).

## Risks & mitigations

- **Phantom deps** (strict node_modules) → surfaced by build/test/lint; fix by declaring deps.
- **`workspace:*` publish rewrite** → validated by Verdaccio e2e locally (CI e2e is off).
- **Node 22 bump** → update CI Node version and README; contributors must run Node 22 LTS.
- **Nx Cloud DTE agents** → must have pnpm available (`corepack enable`) before `start-agent`.

## Out of scope

- Bumping Nx (unless a concrete pnpm failure forces it).
- Re-enabling e2e in CI.
- Refactoring package structure or unrelated dependency updates.
