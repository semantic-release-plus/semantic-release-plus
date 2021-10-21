import { validRange } from 'semver';
import { mocked } from 'ts-jest/utils';
import { getChannel } from './get-channel';

jest.mock('semver');

describe('get-channel', () => {
  const validRangeMock = mocked(validRange);

  beforeEach(() => {
    validRangeMock.mockClear();
  });

  it('should return latest if channel is undefined', async () => {
    expect(getChannel(undefined)).toBe('latest');
  });

  it('should return the channel name if channel is defined and channel is not a semver range', async () => {
    validRangeMock.mockReturnValue(null);
    expect(getChannel('alpha')).toBe('alpha');
  });

  it('should return the major version number if channel a maintenance branch', async () => {
    validRangeMock.mockReturnValue('>=1.0.0 <2.0.0');
    expect(getChannel('1.x.x')).toBe('1');
  });
  it('should return the major minor version number if channel a maintenance branch', async () => {
    validRangeMock.mockReturnValue('>=1.2.0 <=1.3.0');
    expect(getChannel('1.2.x')).toBe('1.2');
  });
});
