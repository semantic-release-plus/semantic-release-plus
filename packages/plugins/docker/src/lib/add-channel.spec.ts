import execa = require('execa');
import { mocked } from 'ts-jest/utils';
import { Context } from 'vm';
import { addChannel } from './add-channel';
import { dockerPull, dockerPush, dockerTag } from './docker-utils';

jest.mock('./docker-utils');

describe('add-channel', () => {
  const dockerPullMock = mocked(dockerPull);
  const dockerTagMock = mocked(dockerTag);
  const dockerPushMock = mocked(dockerPush);
  const context: Context = {
    nextRelease: { channel: 'alpha', version: '1.0.1-alpha.1' },
    logger: {
      log: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    },
  };

  it('should add tag to existing published image', async () => {
    dockerPullMock.mockResolvedValue({
      stdout: 'pulling image',
    } as execa.ExecaReturnValue<string>);
    dockerTagMock.mockResolvedValue({
      stdout: 'tagging image1 as image2',
    } as execa.ExecaReturnValue<string>);
    dockerPushMock.mockResolvedValue({
      stdout: 'pushing image2',
    } as execa.ExecaReturnValue<string>);

    const channel = await addChannel({ name: 'joamos/test' }, context);

    expect(dockerPullMock).toHaveBeenCalledWith(
      'joamos/test:1.0.1-alpha.1',
      context
    );
    expect(context.logger.log).toBeCalledWith('pulling image');
    expect(dockerTagMock).toHaveBeenCalledWith(
      'joamos/test:1.0.1-alpha.1',
      'joamos/test:alpha',
      context
    );
    expect(context.logger.log).toBeCalledWith('tagging image1 as image2');
    expect(dockerPushMock).toHaveBeenCalledWith('joamos/test:alpha', context);
    expect(context.logger.log).toBeCalledWith('pushing image2');
    expect(context.logger.log).toBeCalledWith(
      `Added joamos/test:1.0.1-alpha.1 to tag alpha on docker.io`
    );

    expect(channel).toEqual({
      name: 'docker.io container (@alpha dist-tag)',
      url: 'https://hub.docker.com/r/joamos/test',
      channel: 'alpha'
    });
  });

  it('should add tag to existing published image on alternate registry', async () => {
    dockerPullMock.mockResolvedValue({
      stdout: 'pulling image',
    } as execa.ExecaReturnValue<string>);
    dockerTagMock.mockResolvedValue({
      stdout: 'tagging image1 as image2',
    } as execa.ExecaReturnValue<string>);
    dockerPushMock.mockResolvedValue({
      stdout: 'pushing image2',
    } as execa.ExecaReturnValue<string>);

    const channel = await addChannel({ name: 'joamos/test', registry: 'ghcr.io' }, context);

    expect(dockerPullMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:1.0.1-alpha.1',
      context
    );
    expect(context.logger.log).toBeCalledWith('pulling image');
    expect(dockerTagMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:1.0.1-alpha.1',
      'ghcr.io/joamos/test:alpha',
      context
    );
    expect(context.logger.log).toBeCalledWith('tagging image1 as image2');
    expect(dockerPushMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:alpha',
      context
    );
    expect(context.logger.log).toBeCalledWith('pushing image2');
    expect(context.logger.log).toBeCalledWith(
      `Added ghcr.io/joamos/test:1.0.1-alpha.1 to tag alpha on ghcr.io`
    );

    expect(channel).toEqual({
      name: 'ghcr.io container (@alpha dist-tag)',
      url: 'https://ghcr.io/joamos/test',
      channel: 'alpha'
    });
  });
});
