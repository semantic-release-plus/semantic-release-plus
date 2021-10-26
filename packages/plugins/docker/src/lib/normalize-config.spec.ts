import exp = require('constants');
import { ImageName } from './image-name';
import { normalizeConfig } from './normalize-config';
import {
  NormalizedPluginConfig,
  PluginConfig,
} from './plugin-config.interface';

describe('normalize config', () => {
  it('should return default values when no additional config is specified', () => {
    const testConfig = { name: 'test123' } as PluginConfig;

    const expectedConfig = {
      image: new ImageName(testConfig.name),
      skipLogin: false,
      publishChannelTag: true,
    } as NormalizedPluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });

  it('should return specified values when additional config values are specified', () => {
    const testConfig = {
      name: 'test123',
      skipLogin: true,
      publishChannelTag: false,
      registry: 'my-private-registry:1234',
    } as PluginConfig;

    const expectedImageName = new ImageName(testConfig.name);
    expectedImageName.registry = testConfig.registry;

    const expectedConfig = {
      image: expectedImageName,
      skipLogin: true,
      publishChannelTag: false,
    } as NormalizedPluginConfig;

    const normConfig = normalizeConfig(testConfig);

    expect(normConfig).toEqual(expectedConfig);
  });
});
