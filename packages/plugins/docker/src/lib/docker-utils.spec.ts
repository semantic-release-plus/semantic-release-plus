import { Context } from '@semantic-release-plus/core';
import * as execa from 'execa';
import { mocked } from 'ts-jest/utils';
import { dockerLogin, dockerPull, dockerPush, dockerTag } from './docker-utils';

jest.mock('execa');

describe('docker utils', () => {
  const execaMock = mocked(execa, true);
  const dockerUser = 'user-name';
  const dockerPassword = '!my-testing-password!';

  const context: Context = {
    // stdout: jest.fn(),
    // stderr: jest.fn(),
  };

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

    // execaMock.mockReturnValue({
    //   stdin: {
    //     pipe: jest.fn()
    //   },
    //   stdout: {
    //     pipe: jest.fn(),
    //   } as Readable,
    //   stderr: {
    //     pipe: jest.fn(),
    //   } as unknown,
    // } as ChildProcess
    execaMock.mockResolvedValue({
      //@ts-expect-error mocking execa return is long
      stdout: 'Login Success',
    });

    await dockerLogin(
      {
        userName: dockerUser,
        password: dockerPassword,
      },
      context
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

    execaMock.mockResolvedValue(undefined);

    await dockerLogin(
      {
        userName: dockerUser,
        password: dockerPassword,
        registry: 'ghcr.io',
      },
      context
    );
    expect(execaMock).toHaveBeenCalledWith(...expectedLoginArgs);
  });

  it('should pull image successfully', async () => {
    const expectedPullArgs = [
      'docker',
      ['pull', 'ghcr.io/joa-mos/node:omega'],
      {},
    ];

    // execaMock.mockResolvedValue({
    //   command: 'docker pull ghcr.io/joa-mos/node:omega',
    //   escapedCommand: 'docker pull "ghcr.io/joa-mos/node:omega"',
    //   exitCode: 0,
    //   stdout:
    //     'omega: Pulling from joa-mos/node\n' +
    //     'Digest: sha256:6c288ce65138858f287f23e90b4b4fb788a42ac690ee09ecba73c9e74f6be366\n' +
    //     'Status: Image is up to date for ghcr.io/joa-mos/node:omega\n' +
    //     'ghcr.io/joa-mos/node:omega',
    //   stderr: `time="2021-10-06T08:53:08-07:00" level=error msg="failed to create file hook: while creating logrus local file hook: unable to get 'APPDATA'"`,
    //   all: undefined,
    //   failed: false,
    //   timedOut: false,
    //   isCanceled: false,
    //   killed: false,
    // });
    await dockerPull('ghcr.io/joa-mos/node:omega', {
      stdout: process.stdout,
      stderr: process.stderr,
    });

    expect(execaMock).toHaveBeenCalledWith(...expectedPullArgs);
  }, 100000);

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
