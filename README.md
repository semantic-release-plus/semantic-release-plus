<h1 align="center" style="border-bottom: none;">📦🚀➕ semantic-release-plus nx repo</h1>
<h3 align="center">Monorepo for Fully automated version management and package publishing</h3>

<p align="center">
  <a href="#contributors-">
    <img alt="Github All Contributors" src="https://img.shields.io/github/all-contributors/semantic-release-plus/semantic-release-plus">
  </a>
</p>

# Highlights

This repo will eventually be the single repo for all [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release) core and plugins. Each package will need to be migrated and converted during this process it is intended to make as few if any breaking changes. The new packages will be scoped under `@semantic-release-plus`.

> semantic-release-plus is a fork of semantic-release and is not maintained by the same team as semantic-release.

# Packages

## Core

| Name                           | Description                                         | README                               | Version                                                                                                                             | Downloads                                                                                                                                  |
| ------------------------------ | --------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `@semantic-release-plus/core`  | semantic-release-plus core for shared code          | [README](./packages/core/README.md)  | [![npm](https://img.shields.io/npm/v/@semantic-release-plus/core.svg)](https://www.npmjs.com/package/@semantic-release-plus/core)   | [![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/core.svg)](https://www.npmjs.com/package/@semantic-release-plus/core)   |
| `@semantic-release-plus/error` | semantic-release-plus library for shared error type | [README](./packages/error/README.md) | [![npm](https://img.shields.io/npm/v/@semantic-release-plus/error.svg)](https://www.npmjs.com/package/@semantic-release-plus/error) | [![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/error.svg)](https://www.npmjs.com/package/@semantic-release-plus/error) |

## Plugins

| Name                            | Description                                           | README                                        | Version                                                                                                                               | Downloads                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@semantic-release-plus/docker` | semantic-release-plus plugin to publish docker images | [README](./packages/plugins/docker/README.md) | [![npm](https://img.shields.io/npm/v/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker) | [![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker) |

## Utilities

| Name                              | Description                                                                   | README                                          | Version                                                                                                                                   | Downloads                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@semantic-release-plus/nx-setup` | nx plugin to assist in setting up semantic-release-plus within an nx monorepo | [README](./packages/plugins/nx-setup/README.md) | [![npm](https://img.shields.io/npm/v/@semantic-release-plus/nx-setup.svg)](https://www.npmjs.com/package/@semantic-release-plus/nx-setup) | [![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/nx-setup.svg)](https://www.npmjs.com/package/@semantic-release-plus/nx-setup) |

## External

External packages are planned to be migrated in the future

| Name                    | Description                                   | README                                                                     | Version                                                                                                               | Downloads                                                                                                                    |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `semantic-release-plus` | fork of semantic-release to support monorepos | [README](https://github.com/semantic-release-plus/semantic-release#readme) | [![npm](https://img.shields.io/npm/v/semantic-release-plus.svg)](https://www.npmjs.com/package/semantic-release-plus) | [![downloads](https://img.shields.io/npm/dt/semantic-release-plus.svg)](https://www.npmjs.com/package/semantic-release-plus) |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://justindietz.com"><img src="https://avatars.githubusercontent.com/u/5566979?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Justin Dietz</b></sub></a><br /><a href="https://github.com/semantic-release-plus/semantic-release-plus/commits?author=JoA-MoS" title="Tests">⚠️</a> <a href="https://github.com/semantic-release-plus/semantic-release-plus/commits?author=JoA-MoS" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/erichardson-lee"><img src="https://avatars.githubusercontent.com/u/77331675?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edward Richardson-Lee</b></sub></a><br /><a href="https://github.com/semantic-release-plus/semantic-release-plus/commits?author=erichardson-lee" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
