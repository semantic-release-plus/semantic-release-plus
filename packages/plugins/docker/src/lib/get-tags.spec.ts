import { getTags } from './get-tags';
import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

describe('get docker tags', () => {
  it('should return latest, major, minor, and version tag master', () => {
    // const testConfig = { name: 'test123' } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      skipLogin: false,
      publishChannelTag: true,
      registry: '',
    } as PluginConfig;

    const tags = getTags(
      {
        channel: '1.2.x',
        version: '1.2.5',
        // type: BranchType.Maintenance,
      },
      normalizeConfig(expectedConfig)
    );
  });
});
