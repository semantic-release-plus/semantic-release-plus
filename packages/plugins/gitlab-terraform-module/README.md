# @semantic-release-plus/gitlab-terraform-module

[![npm](https://img.shields.io/npm/v/@semantic-release-plus/gitlab-terraform-module.svg)](https://www.npmjs.com/package/@semantic-release-plus/gitlab-terraform-module)
[![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/gitlab-terraform-module.svg)](https://www.npmjs.com/package/@semantic-release-plus/gitlab-terraform-module)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release-plus](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release--plus-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![license](https://img.shields.io/npm/l/@semantic-release-plus/gitlab-terraform-module.svg)](https://github.com/semantic-release-plus/semantic-release-plus/blob/beta/packages/plugins/docker/LICENSE)

A [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release-plus) or [semantic-release](https://github.com/semantic-release/semantic-release) plugin for publishing a terraform modules to a [gitlab terraform module registry](https://docs.gitlab.com/ee/user/packages/terraform_module_registry/). This plugin will create a tar of the module and upload it to the gitlab terraform module registry following semver standards.

| Step               | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| `verifyConditions` | Verify that all needed configuration and environment variables are present         |
| `publish`          | Creates a tar of the module and uploads it to the gitlab terraform module registry |

## Install

```bash
$ npm install @semantic-release-plus/gitlab-terraform-module -D
```

## Usage

Add the following to your release configuration

```json
{
  "plugins": [
    [
      "@semantic-release-plus/gitlab-terraform-module",
      {
        "moduleName": "my-module",
        "moduleSystem": "local",
        "modulePath": "path/to/module"
      }
    ]
  ]
}
```

## Configuration

| Option             | Description                                                                                                              | Type       | Default                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------- |
| **`moduleName`**   | The name of the module you want to be published                                                                          | `string`   |                                                       |
| **`moduleSystem`** | The module system you want to use examples: aws, gcp, local, ...                                                         | `string`   |                                                       |
| **`modulePath`**   | The path to the directory that holds your module                                                                         | `string`   |                                                       |
| `include`          | An array of glob patterns that will be used to include files in the tar relative to the `modulePath`                     | `string[]` | `['**/*']`                                            |
| `exclude`          | An array of glob patterns that will be used to exclude files from being included in the tar relative to the `modulePath` | `string[]` | `['**/.git', '**/.DS_Store', '**/release.config.js']` |
| `outputDir`        | The directory the compressed modulePath directory is saved to                                                            | `string`   | The system temp directory                             |
| `gitlabApiUrl`     | The url to use when pushing to the the module to the registry                                                            | `string`   | env variable `CI_API_V4_URL`                          |
| `gitlabProjectId`  | The gitlab project ID to push the module to                                                                              | `string`   | env variable `CI_PROJECT_ID`                          |
| `gitlabJobToken`   | The token to use to push to the module registry                                                                          | `string`   | env variable `CI_JOB_TOKEN`                           |

## Troubleshooting

### Upload fails with `HTTP 500`

GitLab's Terraform module registry parses every uploaded archive that contains
`.tf` files. The parser is sensitive to archive structure: a flat archive (files
at the root, no leading `./` entry, no macOS extended-attribute metadata) uploads
cleanly and returns `201 Created`. An archive built by BSD/macOS `tar` — which
adds a leading `./` root entry and `._*` AppleDouble metadata — makes the parser
return `HTTP 500` rather than a clean `4xx`, so it is easy to misdiagnose as a
transient server error.

This plugin builds archives with the Node [`tar`](https://www.npmjs.com/package/tar)
library using explicit relative file paths, which produces a flat archive on Linux
CI runners — so this is mainly a note for anyone reproducing an upload **manually**
on macOS. When doing so, build a flat archive and strip macOS metadata:

```bash
# ❌ 500 — BSD/macOS tar, archive has a leading "./" entry
tar -czf module.tgz -C <moduleDir> .

# ✅ 201 — flat archive, explicit files, no macOS metadata
(cd <moduleDir> && tar --no-xattrs --no-mac-metadata -czf module.tgz main.tf variables.tf outputs.tf README.md)
```
