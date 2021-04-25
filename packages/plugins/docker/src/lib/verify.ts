import * as execa from 'execa';
import { PluginConfig } from './plugin-config.interface';

export async function verifyConditions(pluginConfig: PluginConfig, { logger }) {
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
        pluginConfig.registryUrl || '',
        '-u=' + process.env.DOCKER_USERNAME,
        '-p=' + process.env.DOCKER_PASSWORD,
      ],
      {
        stdio: 'inherit',
      }
    );
  } catch (err) {
    throw new Error('docker login failed');
  }
}
