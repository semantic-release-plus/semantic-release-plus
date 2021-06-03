import * as execa from 'execa';
import { PluginConfig } from './plugin-config.interface';
import { publish } from './publish';

jest.mock('execa');

describe('publish', () => {
  beforeEach(() => {
    ((execa as unknown) as jest.Mock).mockClear();
  });

  it('should publish exact version and latest with default config', () => {
    const pluginConfig = {
      name: 'test',
    } as PluginConfig;

    const context = {
      nextRelease: {
        version: '1.2.3',
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

  it('should publish major, minor, latest, and version when publishMajorTag and publishMinorTag are set to true', () => {
    const pluginConfig = {
      name: 'test',
      publishMajorTag: true,
      publishMinorTag: true,
    } as PluginConfig;

    const context = {
      nextRelease: {
        version: '1.2.3',
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

    const majorTagArgs = [
      'docker',
      ['tag', `${pluginConfig.name}:latest`, `${pluginConfig.name}:1`],
      { stdio: 'inherit' },
    ];

    const minorTagArgs = [
      'docker',
      ['tag', `${pluginConfig.name}:latest`, `${pluginConfig.name}:1.2`],
      { stdio: 'inherit' },
    ];

    const pushVersionArgs = [
      'docker',
      ['push', `${pluginConfig.name}:${version}`],
      {
        stdio: 'inherit',
      },
    ];

    const pushMajorArgs = [
      'docker',
      ['push', `${pluginConfig.name}:1`],
      {
        stdio: 'inherit',
      },
    ];

    const pushMinorArgs = [
      'docker',
      ['push', `${pluginConfig.name}:1.2`],
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

    expect(execa).toHaveBeenNthCalledWith(1, ...tagArgs);
    expect(execa).toHaveBeenNthCalledWith(2, ...majorTagArgs);
    expect(execa).toHaveBeenNthCalledWith(3, ...minorTagArgs);

    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:${version} to docker hub`
    );
    expect(execa).toHaveBeenNthCalledWith(4, ...pushVersionArgs);

    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:1 to docker hub`
    );
    expect(execa).toHaveBeenNthCalledWith(5, ...pushMajorArgs);

    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:1.2 to docker hub`
    );
    expect(execa).toHaveBeenNthCalledWith(6, ...pushMinorArgs);

    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:latest to docker hub`
    );
    expect(execa).toHaveBeenNthCalledWith(7, ...pushLatestArgs);
  });

  it('should publish exact version only and skip latest tag', () => {
    const pluginConfig = {
      name: 'test',
      publishLatestTag: false,
    } as PluginConfig;

    const context = {
      nextRelease: {
        version: '1.2.3',
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

    publish(pluginConfig, context);
    expect(execa).toHaveBeenNthCalledWith(1, ...tagArgs);
    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:${version} to docker hub`
    );
    expect(execa).lastCalledWith(...pushVersionArgs);
  });

  it('should publish exact version only and skip latest tag', () => {
    const pluginConfig = {
      name: 'test',
      publishLatestTag: false,
      registryUrl: 'https://my-registry',
    } as PluginConfig;

    const version = '1.2.3';

    const context = {
      nextRelease: {
        version,
      },
      logger: {
        log: jest.fn(),
      },
    };

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

    publish(pluginConfig, context);
    expect(execa).toHaveBeenNthCalledWith(1, ...tagArgs);
    expect(context.logger.log).toBeCalledWith(
      `Pushing version ${pluginConfig.name}:${version} to https://my-registry`
    );
    expect(execa).lastCalledWith(...pushVersionArgs);
  });
});
