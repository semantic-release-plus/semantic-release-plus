import { Context } from '@semantic-release-plus/core';
import { dockerPull, dockerPush, dockerTag } from './docker-utils';
import { getChannel } from './get-channel';
import { normalizeConfig } from './normalize-config';
import {
  NormalizedPluginConfig,
  PluginConfig,
} from './plugin-config.interface';

export interface NewChannel {
  name: string;
  url: string;
  channel: string;
}

export async function addChannel(
  pluginConfig: PluginConfig,
  context: Context
): Promise<NewChannel> {
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  const { image } = normalizeConfig(pluginConfig) as NormalizedPluginConfig;
  // normally we would assume the image name exactly as written in the name property
  // in this case since there is no guarantee that the image is local on the machine
  // we will prepend the registry if defined to pull from the remote registry

  const channelTag = getChannel(channel);
  const imageVersionTag = `${image.name}:${version}`;
  const imageChannelTag = `${image.name}:${channelTag}`;
  const registry = (image.registry ||  'docker.io');

  // pull the image to the local machine
  const { stdout: pullStdout } = await dockerPull(imageVersionTag, context);
  logger.log(pullStdout);

  // tag the pulled image with the new channel
  const { stdout: tagStdout } = await dockerTag(
    imageVersionTag,
    imageChannelTag,
    context
  );
  logger.log(tagStdout);

  // push the new tagged image to remote registry
  const { stdout: pushStdout } = await dockerPush(imageChannelTag, context);
  logger.log(pushStdout);

  logger.log(`Added ${imageVersionTag} to tag ${channelTag} on ${registry}`);

  const replaces = {
    "ghcr.io": "https://ghcr.io",
    "docker.io": "https://hub.docker.com/r",
    "quay.io": "https://quay.io/repository"
  };

  return {
    name: `${registry} container (@${channelTag} dist-tag)`,
    url: `${!image.registry ? 'docker.io/' : '' }${image.name}`.replace(
      new RegExp('^((?:ghcr|docker).io)', 'gi'),
      matched => replaces[matched]
    ),
    channel: channelTag,
  };
}
