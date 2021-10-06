import * as execa from 'execa';
import { mocked } from 'ts-jest/utils';
import { dockerLogin, dockerPull, dockerPush, dockerTag } from './docker-utils';

jest.mock('execa');

describe('docker utils', () => {
  const execaMock = mocked(execa, true);
  const dockerUser = 'user-name';
  const dockerPassword = '!my-testing-password!';
  beforeEach(() => {
    execaMock.mockClear();
  });

  it('should login successfully to default docker.io', async () => {
    const expectedLoginArgs = [
      'docker',
      ['login', '', '--username', dockerUser, '--password-stdin'],
      {
        input: dockerPassword,
      },
    ];
    execaMock.mockResolvedValue({} as execa.ExecaReturnValue<Buffer>);

    await dockerLogin(
      {
        userName: dockerUser,
        password: dockerPassword,
      },
      {}
    );
    expect(execaMock).toHaveBeenCalledWith(...expectedLoginArgs);
  });

  it('should login successfully to ghcr.io', async () => {
    const expectedLoginArgs = [
      'docker',
      ['login', 'ghcr.io', '--username', dockerUser, '--password-stdin'],
      {
        input: dockerPassword,
      },
    ];
    execaMock.mockResolvedValue({} as execa.ExecaReturnValue<Buffer>);
    await dockerLogin(
      {
        userName: dockerUser,
        password: dockerPassword,
        registry: 'ghcr.io',
      },
      {}
    );
    expect(execaMock).toHaveBeenCalledWith(...expectedLoginArgs);
  });

  it('should pull image successfully', async () => {
    const expectedPullArgs = ['docker', ['pull', 'joa-mos/node:omega'], {}];

    execaMock.mockResolvedValue({} as execa.ExecaReturnValue<Buffer>);
    await dockerPull('joa-mos/node:omega', {});
    expect(execaMock).toHaveBeenCalledWith(...expectedPullArgs);
  });

  it('should tag image successfully', async () => {
    const expectedTagArgs = [
      'docker',
      ['tag', 'joa-mos/node:omega', 'joa-mos/node:epsilon'],
      {},
    ];

    execaMock.mockResolvedValue({} as execa.ExecaReturnValue<Buffer>);
    await dockerTag('joa-mos/node:omega', 'joa-mos/node:epsilon', {});
    expect(execaMock).toHaveBeenCalledWith(...expectedTagArgs);
  });

  it('should push tag successfully', async () => {
    const expectedPushArgs = ['docker', ['push', 'joa-mos/node:omega'], {}];

    execaMock.mockResolvedValue({} as execa.ExecaReturnValue<Buffer>);
    await dockerPush('joa-mos/node:omega', {});
    expect(execaMock).toHaveBeenCalledWith(...expectedPushArgs);
  });
});
