import * as execa from 'execa';
import { PluginConfig } from './plugin-config.interface';

export async function publish(
  pluginConfig: PluginConfig,
  { nextRelease: { version }, logger }
) {
  logger.log(`Pushing version ${pluginConfig.name}:${version} to docker hub`);

  // Push both new version and latest
  execa(
    'docker',
    ['tag', `${pluginConfig.name}:latest`, `${pluginConfig.name}:${version}`],
    { stdio: 'inherit' }
  );
  execa('docker', ['push', `${pluginConfig.name}:${version}`], {
    stdio: 'inherit',
  });
  execa('docker', ['push', `${pluginConfig.name}:latest`], {
    stdio: 'inherit',
  });
}
