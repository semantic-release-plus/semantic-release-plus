export interface PluginConfig {
  name: string;
  registryUrl?: string;
  publishMajorTag?: boolean;
  publishMinorTag?: boolean;
  publishChannelTag?: boolean;
}
