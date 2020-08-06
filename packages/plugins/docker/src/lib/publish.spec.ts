jest.mock('execa');

import { publish } from './publish';
import * as execa from 'execa';

describe('publish', () => {
  beforeEach(() => {
    ((execa as unknown) as jest.Mock).mockClear();
  });
  it('should publish exact version and latest', () => {
    const pluginConfig = {
      name: 'test',
    };

    const context = {
      nextRelease: {
        version: '1.1.1',
      },
      logger: {
        log: jest.fn(),
      },
    };

    const {
      nextRelease: { version },
    } = context;

    const tagArgs = [
      'docker',
      ['tag', `${pluginConfig.name}:latest`, `${pluginConfig.name}:${version}`],
      { stdio: 'inherit' },
    ];

    const pushVersionArgs = [
      'docker',
      ['push', `${pluginConfig.name}:${version}`],
      {
        stdio: 'inherit',
      },
    ];

    const pushLatestArgs = [
      'docker',
      ['push', `${pluginConfig.name}:latest`],
      {
        stdio: 'inherit',
      },
    ];

    publish(pluginConfig, context);
    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:${version} to docker hub`
    );
    expect(execa).toHaveBeenNthCalledWith(1, ...tagArgs);
    expect(execa).toHaveBeenNthCalledWith(2, ...pushVersionArgs);
    expect(execa).toHaveBeenNthCalledWith(3, ...pushLatestArgs);
  });
});
