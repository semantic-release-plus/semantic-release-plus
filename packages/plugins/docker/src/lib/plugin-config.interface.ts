export interface PluginConfig {
  name: string;
  registryUrl?: string;
  publishLatestTag?: boolean;
  publishMajorTag?: boolean;
  publishMinorTag?: boolean;
}
