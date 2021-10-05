import { BranchType, Context } from '@semantic-release-plus/core';
import { mocked } from 'ts-jest/utils';
import { dockerPull, dockerPush, dockerTag } from './docker-utils';
import { PluginConfig } from './plugin-config.interface';
import { publish } from './publish';

jest.mock('./docker-utils');

describe('publish', () => {
  const dockerPullMock = mocked(dockerPull);
  const dockerTagMock = mocked(dockerTag);
  const dockerPushMock = mocked(dockerPush);
  const baseContext: Context = {
    nextRelease: {
      version: '1.2.3',
    },
    logger: {
      log: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    },
  };

  beforeEach(() => {
    dockerPullMock.mockClear();
    dockerTagMock.mockClear();
    dockerPushMock.mockClear();
  });

  it('should publish exact version and latest when not on a channel (merging to master)', async () => {
    const name = 'test';
    const version = '1.2.3';

    const pluginConfig = {
      name,
    } as PluginConfig;

    const context: Context = {
      ...baseContext,
      nextRelease: {
        version,
        type: BranchType.Release,
      },
    };

    const exactTag = `${name}:${version}`;
    const channelTag = `${name}:latest`;

    await publish(pluginConfig, context);
    expect(context.logger.log).toBeCalledWith(`Tagging ${name} as ${exactTag}`);
    expect(dockerTagMock).toHaveBeenCalledWith(name, exactTag, context);

    expect(context.logger.log).toBeCalledWith(
      `Tagging ${name} as ${channelTag}`
    );
    expect(dockerTagMock).toHaveBeenCalledWith(name, channelTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${exactTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(exactTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${channelTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(channelTag, context);
  });

  it('should publish channel tag and version when on a configured channel', async () => {
    const name = 'test';
    const channel = 'alpha';
    const version = '1.2.3-alpha.1';

    const pluginConfig = { name } as PluginConfig;

    const context: Context = {
      ...baseContext,
      nextRelease: {
        version,
        channel,
        type: BranchType.Prerelease,
      },
    };

    const exactTag = `${name}:${version}`;
    const channelTag = `${name}:${channel}`;

    dockerTagMock.mockResolvedValue(undefined);
    dockerPushMock.mockResolvedValue(undefined);

    await publish(pluginConfig, context);

    expect(context.logger.log).toBeCalledWith(`Tagging ${name} as ${exactTag}`);
    expect(dockerTagMock).toHaveBeenCalledWith(name, exactTag, context);

    expect(context.logger.log).toBeCalledWith(
      `Tagging ${name} as ${channelTag}`
    );
    expect(dockerTagMock).toHaveBeenCalledWith(name, channelTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${exactTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(exactTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${channelTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(channelTag, context);
  });

  it('should publish exact version only and skip channel tag', async () => {
    const name = 'test';
    const channel = undefined;
    const version = '1.2.3';

    const pluginConfig = { name, publishChannelTag: false } as PluginConfig;

    const context: Context = {
      ...baseContext,
      nextRelease: {
        version,
        channel,
        type: BranchType.Release,
      },
    };

    const exactTag = `${name}:${version}`;
    // const channelTag = `${name}:${channel}`;

    dockerTagMock.mockResolvedValue(undefined);
    dockerPushMock.mockResolvedValue(undefined);

    await publish(pluginConfig, context);

    expect(context.logger.log).toBeCalledWith(`Tagging ${name} as ${exactTag}`);
    expect(dockerTagMock).toHaveBeenCalledWith(name, exactTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${exactTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(exactTag, context);

    // make sure no other calls were made
    expect(dockerTagMock).toHaveBeenCalledTimes(1);
    expect(dockerPushMock).toHaveBeenCalledTimes(1);
  });

  it('should publish to an alternate registry', async () => {
    const name = 'test';
    const version = '1.2.3';
    const registry = 'ghcr.io';

    const pluginConfig = {
      name,
      registry,
    } as PluginConfig;

    const context: Context = {
      ...baseContext,
      nextRelease: {
        version,
        type: BranchType.Release,
      },
    };

    const exactTag = `${registry}/${name}:${version}`;
    const channelTag = `${registry}/${name}:latest`;

    await publish(pluginConfig, context);
    expect(context.logger.log).toBeCalledWith(`Tagging ${name} as ${exactTag}`);
    expect(dockerTagMock).toHaveBeenCalledWith(name, exactTag, context);

    expect(context.logger.log).toBeCalledWith(
      `Tagging ${name} as ${channelTag}`
    );
    expect(dockerTagMock).toHaveBeenCalledWith(name, channelTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${exactTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(exactTag, context);

    expect(context.logger.log).toBeCalledWith(`Pushing ${channelTag}`);
    expect(dockerPushMock).toHaveBeenCalledWith(channelTag, context);
  });
});
