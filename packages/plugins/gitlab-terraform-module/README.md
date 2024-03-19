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
