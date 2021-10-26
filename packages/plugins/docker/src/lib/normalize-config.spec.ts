import { normalizeConfig } from './normalize-config';
import { PluginConfig } from './plugin-config.interface';

describe('normalize config', () => {
  it('should return default values when no additional config is specified', () => {
    const testConfig = { name: 'test123' } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      fullname: 'test123',
      skipLogin: false,
      publishChannelTag: true,
      registry: '',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });

  it('should return specified values when additional config if specified', () => {
    const testConfig = {
      name: 'test123',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      fullname: 'test123',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });

  it('should normalize docker name and tag if specified', () => {
    const testConfig = {
      name: 'test123:not-latest-but-pr',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      fullname: 'test123:not-latest-but-pr',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });

  it('should normalize docker name and tag event in sha format if specified', () => {
    const testConfig = {
      name: 'test123@sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const expectedConfig = {
      name: 'test123',
      fullname:
        'test123@sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'https://my-private-repo',
    } as PluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });
});
