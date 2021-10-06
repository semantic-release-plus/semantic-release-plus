import { Context } from '@semantic-release-plus/core';
import { dockerLogin } from './docker-utils';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function verifyConditions(
  pluginConfig: PluginConfig,
  context: Context
) {
  const { logger } = context;
  pluginConfig = normalizeConfig(pluginConfig);

  if (pluginConfig.skipLogin) {
    logger.log('Skipping docker login because skipLogin was set to true');
    return;
  }

  for (const envVar of ['DOCKER_USERNAME', 'DOCKER_PASSWORD']) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
  }
  try {
    await dockerLogin(
      {
        userName: process.env.DOCKER_USERNAME,
        password: process.env.DOCKER_PASSWORD,
        registryUrl: pluginConfig.registry,
      },
      context
    );
  } catch (err) {
    logger.error(err);
    throw new Error('docker login failed');
  }
}
