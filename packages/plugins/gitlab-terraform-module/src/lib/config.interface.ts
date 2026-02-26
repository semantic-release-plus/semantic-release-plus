export type PluginConfig = Partial<NormalizedConfig>;

export interface NormalizedConfig {
  moduleName: string;
  moduleSystem: string;
  modulePath: string;
  include: string[];
  exclude?: string[];
  outputDir: string;
  gitlabApiUrl: string;
  gitlabProjectId: string;
  gitlabJobToken: string;
}
