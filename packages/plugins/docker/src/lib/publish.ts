import { Context } from '@semantic-release-plus/core';
import { dockerPush, dockerTag } from './docker-utils';
import { getTags } from './get-tags';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(pluginConfig: PluginConfig, context: Context) {
  const normalizedPluginConfig = normalizeConfig(pluginConfig);

  const { image } = normalizedPluginConfig;
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  let tags = getTags({ channel, version }, normalizedPluginConfig);
  tags = tags.map((tag) => `${image.name}:${tag}`);

  for (const tag of tags) {
    logger.log(`Tagging ${image.localNameWithSuffix} as ${tag}`);
    const { stdout } = await dockerTag(image.localNameWithSuffix, tag, context);
    logger.log(stdout);
  }

  // push each tag
  for (const tag of tags) {
    logger.log(`Pushing ${tag}`);
    const { stdout } = await dockerPush(tag, context);
    logger.log(stdout);
  }
}
