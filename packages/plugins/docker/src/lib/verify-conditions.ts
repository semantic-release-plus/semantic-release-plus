import { Context } from '@semantic-release-plus/core';
import { dockerLogin } from './docker-utils';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function verifyConditions(
  pluginConfig: PluginConfig,
  context: Context
) {
  const { logger, env } = context;
  const {
    skipLogin,
    image: { registry },
  } = normalizeConfig(pluginConfig);

  if (skipLogin) {
    logger.log('Skipping docker login because skipLogin was set to true');
    return;
  }

  for (const envVar of ['DOCKER_USERNAME', 'DOCKER_PASSWORD']) {
    if (!env || !env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
  }
  try {
    await dockerLogin(
      {
        userName: env.DOCKER_USERNAME,
        password: env.DOCKER_PASSWORD,
        registry: registry,
      },
      context
    );
  } catch (err) {
    logger.error(err);
    throw new Error('docker login failed');
  }
}
