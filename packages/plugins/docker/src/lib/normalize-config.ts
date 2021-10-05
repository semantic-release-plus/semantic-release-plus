import { PluginConfig } from './plugin-config.interface';

export function normalizeConfig(pluginConfig: PluginConfig): PluginConfig {
  return {
    registry: '',
    skipLogin: false,
    publishChannelTag: true,
    ...pluginConfig,
  };
}
