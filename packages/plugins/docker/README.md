# @semantic-release-plus/docker

[![npm](https://img.shields.io/npm/v/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)
[![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release-plus](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release--plus-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![license](https://img.shields.io/npm/l/@semantic-release-plus/docker.svg)](https://github.com/semantic-release-plus/semantic-release-plus/blob/beta/packages/plugins/docker/LICENSE)

A [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release) or [semantic-release](https://github.com/semantic-release/semantic-release) plugin for publishing a docker images to a docker registry.

## Key features

- Automatically gets next version based on commit history (semantic-release-plus/semantic-release)
- publishes latest tag
- publishes major tag
- publishes minor tag
- publish to docker hub or other registry

```json
{
  "release": {
    "plugins": [
      [
        "@semantic-release-plus/docker",
        {
          "name": "my-cool-docker-app",
          "publishLatestTag": true,
          "publishMajorTag": true,
          "publishMinorTag": true
        }
      ]
    ]
  }
}
```

Publishing Latest, Major, and Minor tags is a pattern followed by a number of docker images.

## Configuration

Your credentials have to be configured with the environment variables `DOCKER_USERNAME` and `DOCKER_PASSWORD`.

| Option        | Description                                                                                             | Type     | Default |
| ------------- | ------------------------------------------------------------------------------------------------------- | -------- | ------- |
| **`name`**    | Required config associated with the tag name assigned to the image during build `docker build -t name`. | `string` |         |
| `registryUrl` | The docker registry url to login. \_The registryUrl is not used as part of the docker push command      |

it is only used for login. To push registry other than docker hub the registry url/path should be included when tagging
the image\_ | `string` | docker.io |
| `publishLatestTag` | Publishes/Updates `name:latest` tag to point at the latest release. (Skipped for prerelease and maintenance versions.) | `boolean` | true |
| `publishMajorTag` | If releasing `v3.2.1` Publishes/Updates `name:3` to the latest release. (Skipped for prerelease versions.) | `boolean` | false |
| `publishMinorTag` | If releasing `v3.2.1` Publishes/Updates `name:3.2` to the latest release. (Skipped for prerelease versions.) | `boolean` | false |
| `skipLogin` | Skips logging in to docker hub in the verifyConditions step, used if you log in seperately in your CI job. Removes requirement for `DOCKER_USERNAME` and `DOCKER_PASSWORD` environment variables | `boolean` | false |

## Plugins

### `verifyConditions`

Verify that all needed configuration are present and login to the Docker registry.

### `publish`

Tag the image specified by `name` with the new version, push it to Docker Hub and update the `latest`, `major`, `minor` tags based on the configuration.

## Publishing to a registry other than docker hub

When you publish to a registry other than docker hub durring your CI process prior to running semantic release the docker tag needs to include the regitryUrl in the tag.

### Example

If you build your docker image like this

```bash
docker build -t ghcr.io/OWNER/IMAGE_NAME .
```

The plugin config should look like:

```json
{
  "plugins": [
    [
      "@semantic-release-plus/docker",
      {
        "name": " ghcr.io/OWNER/IMAGE_NAME",
        "registryUrl": "ghcr.io", // <-- this needs to be the same as what you would enter in the `docker login` cli command
        "publishLatestTag": true,
        "publishMajorTag": true,
        "publishMinorTag": true
      }
    ]
  ]
}
```

## Example .travis.yml

```yml
jobs:
  include:
    - stage: release
      language: node_js
      node_js: '8'
      services:
        - docker
      script:
        - docker build -t username/imagename .
        - npm run semantic-release

stages:
  - test
  - name: release
    if: branch = master AND type = push AND fork = false

branches:
  except:
    - /^v\d+\.\d+\.\d+$/
```

## Circle CI Example .config.yml

```yml
version: 2
jobs:
  release:
    docker:
      - image: circleci/node:8
    steps:
      - setup_remote_docker:
          docker_layer_caching: true
      - run:
          name: release
          command: |
            docker build -t username/imagename .
            npm run semantic-release

workflows:
  version: 2
  pipeline:
    jobs:
      - test
      - release:
          requires:
            - test
          filters:
            branches:
              only: master
```

> Note that `setup_remote_docker` step is required for this plugin to work in Circle CI environment

## How to keep new version in package.json inside docker image?

It is best to let semantic-release focus on releasing your built artifact and not extend semantic-release to also do the build. I recommend using semantic-release-plus to get the next version without creating a tag then using that durning your build process. An example of this can be found in the semantic-release-plus [Expected next version recipe](https://semantic-release-plus.gitbook.io/semantic-release-plus/recipes/utility/expected-next-version).

### Deprecated Process

In order to do that you need to run `docker build` command during semantic-release `prepareCmd` event.~~

It can be done with help of [@semantic-release/exec](https://github.com/semantic-release/exec) for example.~~

```json
{
  "plugins": [
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "docker build -t username/imagename ."
      }
    ],
    [
      "@semantic-release-plus/docker",
      {
        "name": "username/imagename"
      }
    ]
  ]
}
```

## Migrated to Nx monorepo

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `ng test plugins-docker` to execute the unit tests via [Jest](https://jestjs.io).
