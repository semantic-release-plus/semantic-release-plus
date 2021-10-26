import { Context } from '@semantic-release-plus/core';
import { dockerPush, dockerTag } from './docker-utils';
import { getTags } from './get-tags';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(pluginConfig: PluginConfig, context: Context) {
  pluginConfig = normalizeConfig(pluginConfig);

  const { name, fullname, registry } = pluginConfig;
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  const registryPath = registry ? registry + '/' : '';

  let tags = getTags({ channel, version }, pluginConfig);
  tags = tags.map((tag) => `${registryPath}${name}:${tag}`);

  for (const tag of tags) {
    logger.log(`Tagging ${fullname} as ${tag}`);
    const { stdout } = await dockerTag(fullname, tag, context);
    logger.log(stdout);
  }

  // push each tag
  for (const tag of tags) {
    logger.log(`Pushing ${tag}`);
    const { stdout } = await dockerPush(tag, context);
    logger.log(stdout);
  }
}
