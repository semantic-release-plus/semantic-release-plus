import type { AnyLifecycleContext } from '@semantic-release-plus/core';
import type { NormalizedConfig, PluginConfig } from './config.interface';
import { tmpdir } from 'os';

export function normalizeConfig(
  pluginConfig: Partial<PluginConfig>,
  context: AnyLifecycleContext,
): NormalizedConfig {
  const config = {
    ...pluginConfig,
    include: pluginConfig.include || ['**/*'],
    exclude: pluginConfig.exclude || [
      '**/.git',
      '**/.DS_Store',
      '**/release.config.js',
    ],
    outputDir: pluginConfig.outputDir || tmpdir(),
    // TODO: figure out how we want to handle gitlab provided environment variables vs plugin config variables
    // Usually we say environment variable wins but in this case this would not provide a way to override the
    // env variable since it is provided by gitlab idea 1 create new plugin defined env variables then use the
    // resolution order would be plugin_defined_env_variable || pluginConfig.variable || GITLAB ENV VAR
    // option 2: pluginConfig variable first then gitlab env variable and if you want to use a different var
    // you can get that via the plugin config by setting the plugin variable to process.env['MY_CUSTOM_VAR']
    gitlabApiUrl: pluginConfig.gitlabApiUrl || context.env?.['CI_API_V4_URL'],
    gitlabProjectId:
      pluginConfig.gitlabProjectId || context.env?.['CI_PROJECT_ID'],
    gitlabJobToken: context.env?.['CI_JOB_TOKEN'],
  };

  return config as NormalizedConfig;
}
