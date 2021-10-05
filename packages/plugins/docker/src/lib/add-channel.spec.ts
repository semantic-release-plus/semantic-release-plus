import execa = require('execa');
import { mocked } from 'ts-jest/utils';
import { addChannel } from './add-channel';
import { dockerPull, dockerPush, dockerTag } from './docker-utils';

jest.mock('./docker-utils');

describe('add-channel', () => {
  const dockerPullMock = mocked(dockerPull);
  const dockerTagMock = mocked(dockerTag);
  const dockerPushMock = mocked(dockerPush);
  // beforeEach(() => {});

  it('should add tag to existing published image', async () => {
    dockerPullMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    dockerTagMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    dockerPushMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    const context = {
      nextRelease: { channel: 'alpha', version: '1.0.1-alpha.1' },
      logger: { log: console.log },
    };
    await addChannel({ name: 'joamos/test' }, context);
    expect(dockerPullMock).toHaveBeenCalledWith(
      'joamos/test:1.0.1-alpha.1',
      context
    );
    expect(dockerTagMock).toHaveBeenCalledWith(
      'joamos/test:1.0.1-alpha.1',
      'joamos/test:alpha',
      context
    );
    expect(dockerPushMock).toHaveBeenCalledWith('joamos/test:alpha', context);
  });

  it('should add tag to existing published image on alternate registry', async () => {
    dockerPullMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    dockerTagMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    dockerPushMock.mockResolvedValue({} as execa.ExecaReturnValue<string>);
    const context = {
      nextRelease: { channel: 'alpha', version: '1.0.1-alpha.1' },
      logger: { log: console.log },
    };
    await addChannel({ name: 'joamos/test', registry: 'ghcr.io' }, context);
    expect(dockerPullMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:1.0.1-alpha.1',
      context
    );
    expect(dockerTagMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:1.0.1-alpha.1',
      'ghcr.io/joamos/test:alpha',
      context
    );
    expect(dockerPushMock).toHaveBeenCalledWith(
      'ghcr.io/joamos/test:alpha',
      context
    );
  });
});
