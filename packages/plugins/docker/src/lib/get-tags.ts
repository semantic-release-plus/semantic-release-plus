import { Release } from '@semantic-release-plus/core';
import { getChannel } from './get-channel';
import { NormalizedPluginConfig } from './plugin-config.interface';

export function getTags(
  { channel, version }: Release,
  { publishChannelTag }: NormalizedPluginConfig
): string[] {
  const tags: string[] = [version];
  if (publishChannelTag) {
    tags.push(getChannel(channel));
  }
  return tags;
}

/**
 * master 1.2.3 - 1.2.3, latest
 * next 1.2.3 - 1.2.3, next
 * prerelease
 *      alpha  1.2.3-alpha.1 - alpha, 1.2.3-alpha.1
 * maintenance branch
 *      1.2.x 1.2.3 - 1.2.3, 1.2
 *      1.x.x 1.2.3 - 1.2.3, 1
 */
