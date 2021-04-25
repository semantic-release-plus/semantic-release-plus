# @semantic-release-plus/docker

[![semantic-release-plus](https://circleci.com/gh/semantic-release-plus/semantic-release-plus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/semantic-release-plus/semantic-release-plus?branch=master)
[![npm](https://img.shields.io/npm/v/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)
[![downloads](https://img.shields.io/npm/dt/@semantic-release-plus/docker.svg)](https://www.npmjs.com/package/@semantic-release-plus/docker)

<!-- [![dependencies](https://img.shields.io/david/felixfbecker/semantic-release-docker.svg)](https://david-dm.org/felixfbecker/semantic-release-docker) -->
<!-- [![peerDependencies](https://david-dm.org/felixfbecker/semantic-release-docker/peer-status.svg)](https://david-dm.org/felixfbecker/semantic-release-docker?type=peer) -->
<!-- [![Greenkeeper](https://badges.greenkeeper.io/felixfbecker/semantic-release-docker.svg)](https://greenkeeper.io/) -->

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release-plus](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release--plus-e10079.svg)](https://github.com/semantic-release-plus/semantic-release)
[![license](https://img.shields.io/npm/l/semantic-release-docker.svg)](https://github.com/semantic-release-plus/semantic-release-plus/blob/master/packages/plugins/docker/LICENSE)

Set of [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release) plugins for publishing a docker image to
[Docker Hub](https://hub.docker.com/) or a private docker registry.

```json
{
  "release": {
    "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-docker",
      {
        "name": "my-cool-docker-app",
      },
    ],
  ],
}
```

## Configuration

Your credentials have to be configured with the environment variables `DOCKER_USERNAME` and `DOCKER_PASSWORD`.

In addition, you need to specify the name of the image as the `name` setting in the publish step. If you need to specify a custom docker registry URL, add it as the `registryUrl` setting in the verifyConditions step.

## Plugins

### `verifyConditions`

Verify that all needed configuration is present and login to the Docker registry.

### `publish`

Tag the image specified by `name` with the new version, push it to Docker Hub and update the `latest` tag.

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

### Using semantic-release-plus

semantic-release-plus introduced a configuration option to skip git tagging which allows you to run specific plugins without and performing steps but will skip altering your git repository or adding any tagging.

In this example we are building a docker image that must include a file in the docker image that includes the build number. This is created by a custom semantic-release plugin call application-info. But you could use the exec plugin to accomplish a similar task of writing to a file or some other destination.

Create your standard release.config.js

```JavaScript
// release.config.js
module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      'semantic-release-docker',
      {
        name: `my-cool-docker-app`,
      },
    ],
  ],
};
```

> this is just an example config you may need something more complex in your scenario

Create a pre-release.config.js that will be run before running semantic-release that extends your base release config overriding the the skipTag property and plugins property to only include the plugins needed in the pre-release stage.

```JavaScript
// pre-release.config.js
// npx semantic-release --extends=./pre-release.config.js

const baseReleaseConfig = require('./release.config.js');

module.exports = {
  ...baseReleaseConfig,
  skipTag: true, // <-- don't tag anything in git
  plugins: ['@semantic-release/commit-analyzer', './release-scripts/application-info'], // <-- Only run the plugins needed to generate the files needed in the build.
};
```

In your CI solution you should run `npx semantic-release --extends=./pre-release.config.js` prior to building your application to perform any tasks that are required as part of the build and to include the next version number.

### Using semantic-release

> In general semantic-release should not be building your artifacts it should only be focused on versioning and publishing a release, but because of the limitations of semantic=release this is an approach to solve this.

In order to do that you need to run `docker build` command during semantic-release `prepareCmd` event.

It can be done with help of [@semantic-release/exec](https://github.com/semantic-release/exec) for example.

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
      "semantic-release-docker",
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
