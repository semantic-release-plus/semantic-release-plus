export function getReleaseInfo(image, channelTag) {
  const registry = (image.registry ||  'docker.io');

  return {
    name: `${registry} container (@${channelTag} dist-tag)`,
    url: `${ !image.registry ? registry + '/' : '' }${image.name}`.replace(
      new RegExp('^((?:ghcr|docker|quay).io)', 'gi'),
      matched => ({
        "ghcr.io": "https://ghcr.io",
        "docker.io": "https://hub.docker.com/r",
        "quay.io": "https://quay.io/repository"
      })[matched]
    ),
    channel: channelTag,
  }
}
