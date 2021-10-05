import { Context } from '@semantic-release-plus/core';
import { dockerPush, dockerTag } from './docker-utils';
import { getTags } from './get-tags';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function publish(pluginConfig: PluginConfig, context: Context) {
  pluginConfig = normalizeConfig(pluginConfig);

  const { name, registry: registryUrl } = pluginConfig;
  const {
    nextRelease: { version, channel },
    logger,
  } = context;

  const registry = registryUrl ? registryUrl + '/' : '';

  let tags = getTags({ channel, version }, pluginConfig);
  tags = tags.map((tag) => `${registry}${name}:${tag}`);

  tags.forEach((tag) => {
    logger.log(`Tagging ${name} as ${tag}`);
    dockerTag(name, tag, context);
  });

  // push each tag
  // todo: consider using docker push --all-tags in the future
  tags.forEach((tag) => {
    logger.log(`Pushing ${tag}`);
    dockerPush(tag, context);
  });
}
