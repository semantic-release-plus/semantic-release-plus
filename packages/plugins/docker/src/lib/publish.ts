import * as execa from 'execa';
import * as semver from 'semver';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(
  pluginConfig: PluginConfig,
  { nextRelease: { version }, logger }
) {
  pluginConfig = normalizeConfig(pluginConfig);

  const {
    publishLatestTag,
    publishMajorTag,
    publishMinorTag,
    registryUrl,
    name,
  } = pluginConfig;

  // Push both new version and latest
  const { major, minor } = semver.parse(version);
  const tags = [`${name}:${version}`];

  if (publishMajorTag) {
    tags.push(`${name}:${major}`);
  }
  if (publishMinorTag) {
    tags.push(`${name}:${major}.${minor}`);
  }

  // create a tag for each configured tag to publish
  tags.forEach((t) => {
    execa('docker', ['tag', `${name}:latest`, t], {
      stdio: 'inherit',
    });
  });

  // adding latest tag after image tagging as latest already exists
  if (publishLatestTag) {
    tags.push(`${name}:latest`);
  }

  // push each tag
  // todo: consider using docker push --all-tags in the future
  tags.forEach((t) => {
    logger.log(`Pushing version ${t} to ${registryUrl || 'docker hub'}`);
    execa('docker', ['push', t], {
      stdio: 'inherit',
    });
  });
}
