import { ImageName } from './image-name';
import {
  NormalizedPluginConfig,
  PluginConfig,
} from './plugin-config.interface';

export function normalizeConfig(
  pluginConfig: PluginConfig
): NormalizedPluginConfig {
  const { name, registry, skipLogin, publishChannelTag } = {
    registry: '',
    skipLogin: false,
    publishChannelTag: true,
    ...pluginConfig,
  };

  const imageName = new ImageName(name);

  if (!imageName.registry && registry) {
    imageName.registry = registry;
  }

  return {
    image: imageName,
    skipLogin,
    publishChannelTag,
  };
}
