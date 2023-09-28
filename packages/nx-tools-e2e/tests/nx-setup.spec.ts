import { ensureNxProject, runNxCommandAsync, uniq } from '@nx/plugin/testing';
describe('nx-tools e2e', () => {
  it('should create nx-tools', async () => {
    const plugin = uniq('nx-tools');

    ensureNxProject(
      '@semantic-release-plus/nx-tools',
      'dist/packages/nx-tools'
    );
    await runNxCommandAsync(
      `generate @nx/node:library --name=${plugin} --buildable --publishable --importPath=${plugin}`
    );
    await runNxCommandAsync(
      `generate @semantic-release-plus/nx-tools:configure --project=${plugin}`
    );
    // FIXME: Assert something
  }, 80000);
});
