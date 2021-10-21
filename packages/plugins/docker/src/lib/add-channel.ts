import { Context } from '@semantic-release-plus/core';
import { dockerPull, dockerPush, dockerTag } from './docker-utils';
import { getChannel } from './get-channel';
import { PluginConfig } from './plugin-config.interface';

export interface NewChannel {
  name: string;
  url: string;
  channel: string;
}

export async function addChannel(
  { name, registry }: PluginConfig,
  context: Context
): Promise<NewChannel> {
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  // normally we would assume the image name exactly as written in the name property
  // in this case since there is no guarantee that the image is local on the machine
  // we will prepend the registry if defined to pull from the remote registry

  const registryPath = registry ? registry + '/' : '';
  const channelTag = getChannel(channel);
  const imageVersionTag = `${registryPath}${name}:${version}`;
  const imageChannelTag = `${registryPath}${name}:${channelTag}`;

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

  logger.log(
    `Added ${imageVersionTag} to tag ${channelTag} on ${
      registry || 'docker.io'
    }`
  );

  return {
    name: `docker container ${channelTag} tag`,
    url: registry || 'docker.io',
    channel: channelTag,
  };
}
