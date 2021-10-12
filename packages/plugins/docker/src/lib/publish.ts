import { Context } from '@semantic-release-plus/core';
import { dockerPush, dockerTag } from './docker-utils';
import { getTags } from './get-tags';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(pluginConfig: PluginConfig, context: Context) {
  pluginConfig = normalizeConfig(pluginConfig);

  const { name, registry } = pluginConfig;
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  const registryPath = registry ? registry + '/' : '';

  let tags = getTags({ channel, version }, pluginConfig);
  tags = tags.map((tag) => `${registryPath}${name}:${tag}`);

  tags.forEach(async (tag) => {
    logger.log(`Tagging ${name} as ${tag}`);
    try {
      const { stdout } = await dockerTag(name, tag, context);
      logger.log(stdout);
    } catch (err) {
      logger.error(err);
      throw new Error(
        `There was an error tagging '${name}' as '${tag}', check that '${name}' is available`
      );
    }
  });

  // push each tag
  tags.forEach(async (tag) => {
    logger.log(`Pushing ${tag}`);
    const { stdout } = await dockerPush(tag, context);
    logger.log(stdout);
  });
}
