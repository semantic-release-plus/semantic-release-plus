export interface PluginConfig {
  name: string;
  skipLogin?: boolean;
  registryUrl?: string;
  publishLatestTag?: boolean;
  publishMajorTag?: boolean;
  publishMinorTag?: boolean;
}
