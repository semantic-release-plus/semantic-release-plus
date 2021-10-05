import { validRange } from 'semver';

export function getChannel(channel: string): string {
  return channel
    ? validRange(channel)
      ? `release-${channel}`
      : channel
    : 'latest';
}
