jest.mock('execa');

import * as execa from 'execa';
import { verifyConditions } from './verify';

describe('verify', () => {
  beforeEach(() => {
    ((execa as unknown) as jest.Mock).mockClear();
    delete process.env.DOCKER_USERNAME;
    delete process.env.DOCKER_PASSWORD;
  });

  describe('master based configuration', () => {
    const dockerUser = 'dockerUserName';
    const dockerPassword = 'dockerPW';

    const pluginConfig = {
      name: 'test',
      // registryUrl: undefined,
    } as any;

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

    it('should try to login to default docker registry', async () => {
      process.env.DOCKER_USERNAME = dockerUser;
      process.env.DOCKER_PASSWORD = dockerPassword;

      const dockerLoginArgs = [
        'docker',
        ['login', '', `-u=${dockerUser}`, '-p=' + dockerPassword],
        {
          stdio: 'inherit',
        },
      ];

      verifyConditions(pluginConfig, context);

      expect(execa).toHaveBeenCalledWith(...dockerLoginArgs);
    });

    it('should try to login to specified docker registry', async () => {
      process.env.DOCKER_USERNAME = dockerUser;
      process.env.DOCKER_PASSWORD = dockerPassword;
      pluginConfig.registryUrl = 'https://my-reg.url';

      const dockerLoginArgs = [
        'docker',
        [
          'login',
          'https://my-reg.url',
          `-u=${dockerUser}`,
          '-p=' + dockerPassword,
        ],
        {
          stdio: 'inherit',
        },
      ];

      verifyConditions(pluginConfig, context);

      expect(execa).toHaveBeenCalledWith(...dockerLoginArgs);
    });

    it('should throw error when missing environment variable', async () => {
      await expect(verifyConditions(pluginConfig, context)).rejects.toThrow();
    });

    it('should throw error if login fails', async () => {
      process.env.DOCKER_USERNAME = dockerUser;
      process.env.DOCKER_PASSWORD = dockerPassword;
      ((execa as undefined) as jest.Mock).mockRejectedValue(
        new Error('test error')
      );
      await expect(verifyConditions(pluginConfig, context)).rejects.toThrow();
    });
  });
});
