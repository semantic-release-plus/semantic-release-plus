import * as execa from 'execa';
import * as semver from 'semver';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(
  pluginConfig: PluginConfig,
  { nextRelease: { version }, logger, branch: { type } }
) {
  pluginConfig = normalizeConfig(pluginConfig);

  const {
    publishLatestTag,
    publishMajorTag,
    publishMinorTag,
    registryUrl,
    name,
  } = pluginConfig;

  const isPrerelease = type === 'prerelease';
  const isMaintenance = type === 'maintenance';

  // add a tag for the specific version
  const { major, minor } = semver.parse(version);
  const tags = [`${name}:${version}`];

  // add a major tag if configured, except for pre-releases.
  if (publishMajorTag) {
    if (isPrerelease) {
      logger.info('Skipping major tag for prerelease version.');
    }
    tags.push(`${name}:${major}`);
  }

  // add a minor tag if configured, except for pre-releases.
  if (publishMinorTag) {
    if (isPrerelease) {
      logger.info('Skipping minor tag for prerelease version.');
    } else {
      tags.push(`${name}:${major}.${minor}`);
    }
  }

  // create a tag for each configured tag to publish
  tags.forEach((t) => {
    execa('docker', ['tag', `${name}:latest`, t], {
      stdio: 'inherit',
    });
  });

  // adding latest tag after image tagging as latest already exists
  if (publishLatestTag) {
    if (isPrerelease || isMaintenance) {
      logger.info(`Skipping latest tag for ${type} version.`);
    } else {
      tags.push(`${name}:latest`);
    }
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
