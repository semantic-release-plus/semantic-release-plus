import { Context } from '@semantic-release-plus/core';
import { dockerLogin, dockerPull, dockerPush, dockerTag } from './docker-utils';

describe('docker utils', () => {
  const dockerUser = 'user-name';
  const dockerPassword = '!my-testing-password!';

  const context: Context = {
    // stdout: jest.fn(),
    // stderr: jest.fn(),
  };

  it('should login successfully to default docker.io', async () => {
    try {
      const { stdout } = await dockerPush('test/jrd/abc', context);
      console.log(stdout);
    } catch (err) {
      console.log(err);
    }
  });
});
