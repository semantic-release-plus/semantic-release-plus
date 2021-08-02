import * as execa from 'execa';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

export async function verifyConditions(pluginConfig: PluginConfig, { logger }) {
  pluginConfig = normalizeConfig(pluginConfig);
  for (const envVar of ['DOCKER_USERNAME', 'DOCKER_PASSWORD']) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
  }
  try {
    await execa(
      'docker',
      [
        'login',
        pluginConfig.registryUrl,
        '-u=' + process.env.DOCKER_USERNAME,
        '--password-stdin',
      ],
      {
        input: process.env.DOCKER_PASSWORD,
      }
    );
    logger.log(
      `docker successfully logged in to "${
        pluginConfig.registryUrl || 'docker hub'
      }"`
    );
  } catch (err) {
    throw new Error(`docker login failed: ${err?.stderr}`);
  }
}
