import { validRange } from 'semver';

export function getChannel(channel: string): string {
  // If a channel name is defined in the release config for the current branch
  if (channel) {
    // If that branch/channel name is a semver range like 1.x.x
    if (validRange(channel)) {
      // get the tag without the x's
      return channel
        .split('.')
        .filter((v) => v !== 'x')
        .join('.');
    } else {
      // otherwise just use the channel name (alpha, beta, next)
      return channel;
    }
  } else {
    return 'latest';
  }
}
