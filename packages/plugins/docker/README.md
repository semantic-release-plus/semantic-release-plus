# @semantic-release-plus/docker

[![npm](https://img.shields.io/npm/v/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)
[![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release-plus](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release--plus-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![license](https://img.shields.io/npm/l/@semantic-release-plus/docker.svg)](https://github.com/semantic-release-plus/semantic-release-plus/blob/beta/packages/plugins/docker/LICENSE)

A [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release) or [semantic-release](https://github.com/semantic-release/semantic-release) plugin for publishing a docker images to a docker registry.

| Step               | Description                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify that all needed configuration and `DOCKER_USERNAME` and `DOCKER_PASSWORD` environment variables are present and logs into the Docker registry unless skipped.      |
| `addChannel`       | Tag an existing image with a new channel. _Run only if there are releases that have been merged from a higher branch but not added on the channel of the current branch._ |
| `publish`          | Tag the image specified by `name` as `{registry}/{name}:{version}` and `{registry}/{name}:{channel}` (based on configuration) and push it to the Docker registry.         |

## Install

```bash
$ npm install @semantic-release/npm -D
```

## Usage

The plugin can be configured in the [**semantic-release-plus** configuration file](https://github.com/semantic-release-plus/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "release": {
    "plugins": [
      [
        "@semantic-release-plus/docker",
        {
          "name": "my-cool-docker-app"
        }
      ]
    ]
  }
}
```

## Configuration

| Option              | Description                                                                                                                                                                                                                                                                                                                                                                | Type      | Default   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- |
| **`name`**          | Required config associated with the tag name assigned to the image during build `docker build -t name`.                                                                                                                                                                                                                                                                    | `string`  |           |
| `registry`          | The docker registry to login and push images to, this will be pre-pended to the name field when tagging                                                                                                                                                                                                                                                                    | `string`  | docker.io |
| `publishChannelTag` | Will publish a channel (dist) tag such as `latest`, `next`, `beta`, `alpha`, `1`, and `1.1`, that always points to the most recent release on the channel. `1`, `1.1` tags will only be created on maintenance branches. See [Publishing maintenance releases](https://github.com/semantic-release-plus/semantic-release/blob/master/docs/recipes/maintenance-releases.md) | `boolean` | true      |
| `skipLogin`         | Skips logging in to docker hub in the verifyConditions step, used if you log in separately in your CI job. Removes requirement for `DOCKER_USERNAME` and `DOCKER_PASSWORD` environment variables                                                                                                                                                                           | `boolean` | false     |

## Example github action publishing to ghcr.io

The following is an example github action configuration, the source repo can be found at https://github.com/JoA-MoS/srp-docker-example

```yml
name: CI

on:
  push:
    branches:
      - master
      - next
      - beta
      - alpha
      - '*.x'
  pull_request:
    types:
      - opened
      - synchronize

jobs:
  build_release:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - run: docker build --tag joa-mos/srp-docker-example .
      - name: Release
        uses: actions/setup-node@v2
        with:
          cache: npm
      - run: npm ci
      - run: npx semantic-release-plus
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DOCKER_USERNAME: joa-mos
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
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

It is best to let semantic-release focus on releasing your built artifact and not extend semantic-release to also do the build. I recommend using semantic-release-plus to get the next version without creating a tag then using that durning your build process. An example of this can be found in the semantic-release-plus [Expected next version recipe](https://github.com/semantic-release-plus/semantic-release/blob/20b0c4420e5466a7d7ed16fb3fe4981609173187/docs/recipes/expected-next-version.md#L1).
