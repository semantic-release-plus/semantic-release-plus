import { ensureNxProject, runNxCommandAsync, uniq } from '@nx/plugin/testing';
describe('nx-setup e2e', () => {
  it('should create nx-setup', async () => {
    const plugin = uniq('nx-setup');

    ensureNxProject(
      '@semantic-release-plus/nx-setup',
      'dist/packages/nx-setup'
    );
    await runNxCommandAsync(
      `generate @nx/node:library --name=${plugin} --buildable --publishable --importPath=${plugin}`
    );
    await runNxCommandAsync(
      `generate @semantic-release-plus/nx-setup:configure --project=${plugin}`
    );
    // FIXME: Assert something
  }, 80000);
});
