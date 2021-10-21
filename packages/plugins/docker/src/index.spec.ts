import * as dockerPluginImport from './index';

describe('index', () => {
  const expectedLifeCycleHooks = ['verifyConditions', 'addChannel', 'publish'];

  it('should have verifyConditions, addChannel, and publish when imported', () => {
    verifyPluginLifecycleHooks(dockerPluginImport, expectedLifeCycleHooks);
  });

  it('should have verifyConditions, addChannel, and publish when required', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dockerPlugin = require('./index');
    verifyPluginLifecycleHooks(dockerPlugin, expectedLifeCycleHooks);
  });

  it('should have verifyConditions, addChannel, and publish when lazyImport', async () => {
    const dockerPlugin = await import('./index');
    verifyPluginLifecycleHooks(dockerPlugin, expectedLifeCycleHooks);
  });
});

function verifyPluginLifecycleHooks(plugin, lifeCycleHooks: string[]) {
  for (const lch of lifeCycleHooks) {
    expect(plugin).toHaveProperty(lch);
  }
  expect(Object.keys(plugin).length).toBe(lifeCycleHooks.length);
}
