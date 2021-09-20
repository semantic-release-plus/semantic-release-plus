import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

describe('normalize config', () => {
  it('should return default values when no additional config is specified', () => {
    const testConfig = { name: 'test123' } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      skipLogin: false,
      publishMajorTag: false,
      publishMinorTag: false,
      publishLatestTag: true,
      registryUrl: '',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });

  it('should return specified values when additional config is specified', () => {
    const testConfig = {
      name: 'test123',
      skipLogin: true,
      publishMajorTag: true,
      publishMinorTag: true,
      publishLatestTag: false,
      registryUrl: 'https://my-private-repo',
    } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      skipLogin: true,
      publishMajorTag: true,
      publishMinorTag: true,
      publishLatestTag: false,
      registryUrl: 'https://my-private-repo',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });
});
