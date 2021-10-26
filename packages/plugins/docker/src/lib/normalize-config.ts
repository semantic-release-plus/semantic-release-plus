import { PluginConfig } from './plugin-config.interface';

export function normalizeConfig(pluginConfig: PluginConfig): PluginConfig {
  let name = pluginConfig.name;
  if (name.includes('@sha')) {
    name = name.split('@')[0];
  } else if (name.includes(':')) {
    name = name.split(':')[0];
  }
  return {
    registry: '',
    skipLogin: false,
    publishChannelTag: true,
    ...pluginConfig,
    fullname: pluginConfig.name,
    name,
  };
}
