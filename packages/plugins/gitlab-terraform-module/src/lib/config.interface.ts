export type PluginConfig = Partial<NormalizedConfig>;

export interface NormalizedConfig {
  moduleName: string;
  moduleSystem: string;
  modulePath: string;
  gitlabApiUrl: string;
  gitlabProjectId: string;
  gitlabJobToken: string;
}
