import { getChannel } from './get-channel';

test('Get default channel', () => {
  expect(getChannel(undefined)).toBe('latest');
});

test('Get passed channel if valid', () => {
  expect(getChannel('next')).toBe('next');
  expect(getChannel('alpha')).toBe('alpha');
  expect(getChannel('beta')).toBe('beta');
});

test('Prefix channel with "release-" if invalid', () => {
  expect(getChannel('1.x')).toBe('release-1.x');
  expect(getChannel('1.0.0')).toBe('release-1.0.0');
});
