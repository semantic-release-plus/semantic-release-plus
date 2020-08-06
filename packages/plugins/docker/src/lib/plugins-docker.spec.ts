import { pluginsDocker } from './plugins-docker';

describe('pluginsDocker', () => {
  it('should work', () => {
    expect(pluginsDocker()).toEqual('plugins-docker');
  });
});
