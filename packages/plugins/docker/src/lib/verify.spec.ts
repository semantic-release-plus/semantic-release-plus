import * as execa from 'execa';
import { mocked } from 'ts-jest/utils';
import { dockerLogin } from './docker-utils';
import { PluginConfig } from './plugin-config.interface';
import { verifyConditions } from './verify';

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

  const context = {
    nextRelease: {
      version: '1.1.1',
    },
    logger: {
      log: jest.fn(),
    },
  };

  beforeEach(() => {
    dockerLoginMock.mockClear();
    delete process.env.DOCKER_USERNAME;
    delete process.env.DOCKER_PASSWORD;
  });

  it('should try to login to default docker registry', async () => {
    process.env.DOCKER_USERNAME = dockerUser;
    process.env.DOCKER_PASSWORD = dockerPassword;

    dockerLoginMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);

    verifyConditions(pluginConfig, context);

    expect(dockerLoginMock).toHaveBeenCalledWith(
      {
        userName: dockerUser,
        password: dockerPassword,
        registryUrl: '',
      },
      context
    );
  });

  it('should try to login to specified docker registry', async () => {
    process.env.DOCKER_USERNAME = dockerUser;
    process.env.DOCKER_PASSWORD = dockerPassword;
    pluginConfig.registry = 'https://my-reg.url';

    verifyConditions(pluginConfig, context);

    expect(dockerLoginMock).toHaveBeenCalledWith(
      {
        userName: dockerUser,
        password: dockerPassword,
        registryUrl: pluginConfig.registry,
      },
      context
    );
  });

  it('should throw error when missing environment variable', async () => {
    await expect(verifyConditions(pluginConfig, context)).rejects.toThrow();
  });

  it('should throw error if login fails', async () => {
    process.env.DOCKER_USERNAME = dockerUser;
    process.env.DOCKER_PASSWORD = dockerPassword;
    dockerLoginMock.mockRejectedValue(new Error('test error'));
    await expect(verifyConditions(pluginConfig, context)).rejects.toThrow();
  });

  it('should skip logging in to docker if set to in config', async () => {
    expect(verifyConditions(pluginConfigNoLogin, context)).resolves;
    expect(context.logger.log).toBeCalledWith(
      'Skipping docker login because skipLogin was set to true'
    );
    expect(dockerLoginMock).not.toHaveBeenCalled();
  });
});
