import { PluginConfig } from './plugin-config.interface';

export function normalizeConfig(pluginConfig: PluginConfig): PluginConfig {
  return {
    registryUrl: '',
    publishMajorTag: false,
    publishMinorTag: false,
    publishLatestTag: true,
    ...pluginConfig,
  };
}
