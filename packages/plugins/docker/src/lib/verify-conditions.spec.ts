import { mocked } from 'ts-jest/utils';
import { Context } from '@semantic-release-plus/core';
import { dockerLogin } from './docker-utils';
import { PluginConfig } from './plugin-config.interface';
import { verifyConditions } from './verify-conditions';

jest.mock('./docker-utils');

describe('verify', () => {
  const dockerLoginMock = mocked(dockerLogin, true);
  const dockerUser = 'dockerUserName';
  const dockerPassword = 'dockerPW';

  const pluginConfig = {
    name: 'test',
  } as PluginConfig;

  const pluginConfigNoLogin = {
    name: 'test',
    skipLogin: true,
  } as PluginConfig;

  const context: Context = {
    nextRelease: {
      version: '1.1.1',
    },
    logger: {
      log: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    },
  };

  beforeEach(() => {
    dockerLoginMock.mockClear();
  });

  it('should try to login to default docker registry', async () => {
    const tstContext: Context = {
      ...context,
      env: {
        DOCKER_USERNAME: dockerUser,
        DOCKER_PASSWORD: dockerPassword,
      },
    };
    dockerLoginMock.mockResolvedValue(undefined);

    verifyConditions(pluginConfig, tstContext);

    expect(dockerLoginMock).toHaveBeenCalledWith(
      {
        userName: dockerUser,
        password: dockerPassword,
        registry: undefined,
      },
      tstContext
    );
  });

  it('should try to login to specified docker registry', async () => {
    const tstContext: Context = {
      ...context,
      env: {
        DOCKER_USERNAME: dockerUser,
        DOCKER_PASSWORD: dockerPassword,
      },
    };
    pluginConfig.registry = 'https://my-reg.url';

    verifyConditions(pluginConfig, tstContext);

    expect(dockerLoginMock).toHaveBeenCalledWith(
      {
        userName: dockerUser,
        password: dockerPassword,
        registry: pluginConfig.registry,
      },
      tstContext
    );
  });

  it('should throw error when missing environment variable', async () => {
    await expect(verifyConditions(pluginConfig, context)).rejects.toThrow();
  });

  it('should throw error if login fails', async () => {
    const tstContext: Context = {
      ...context,
      env: {
        DOCKER_USERNAME: dockerUser,
        DOCKER_PASSWORD: dockerPassword,
      },
    };
    dockerLoginMock.mockImplementation(() => {
      throw new Error('docker cli login error');
    });
    expect.assertions(2);
    try {
      await verifyConditions(pluginConfig, tstContext);
    } catch (e) {
      expect(tstContext.logger.error).toBeCalledWith(
        new Error('docker cli login error')
      );
      expect(e.message).toBe('docker login failed');
    }
  });

  it('should throw error if docker user and password env variables are not populated and skip login is false', async () => {
    expect.assertions(1);
    try {
      await verifyConditions(pluginConfig, context);
    } catch (e) {
      expect(e.message).toBe('Environment variable DOCKER_USERNAME is not set');
    }
  });

  it('should skip logging in to docker if set to in config', async () => {
    expect(verifyConditions(pluginConfigNoLogin, context)).resolves;
    expect(context.logger.log).toBeCalledWith(
      'Skipping docker login because skipLogin was set to true'
    );
    expect(dockerLoginMock).not.toHaveBeenCalled();
  });
});
