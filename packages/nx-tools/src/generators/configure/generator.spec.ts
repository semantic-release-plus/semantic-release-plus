import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './generator';
import { ConfigureGeneratorSchema } from './schema';

describe('configure generator', () => {
  let appTree: Tree;
  const options: ConfigureGeneratorSchema = { project: 'test-lib' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(appTree, 'test-lib', {
      root: 'packages/test-lib',
      sourceRoot: 'packages/test-lib/src',
      projectType: 'library',
      targets: {
        build: {
          executor: '@nx/js:tsc',
          options: {
            outputPath: 'dist/packages/test-lib',
          },
        },
      },
    });
    appTree.write(
      'packages/test-lib/package.json',
      JSON.stringify({ name: '@scope/test-lib', version: '0.0.1' }),
    );
  });

  it('should create release.config.base.js at workspace root', async () => {
    await generator(appTree, options);

    expect(appTree.exists('release.config.base.js')).toBeTruthy();
  });

  it('should create release.config.js in the project root', async () => {
    await generator(appTree, options);

    expect(appTree.exists('packages/test-lib/release.config.js')).toBeTruthy();
  });

  it('should add a release target with nx:run-commands executor', async () => {
    await generator(appTree, options);

    const projectConfig = readProjectConfiguration(appTree, 'test-lib');
    expect(projectConfig.targets['release']).toBeDefined();
    expect(projectConfig.targets['release'].executor).toBe('nx:run-commands');
  });

  it('should generate a release command that uses semantic-release', async () => {
    await generator(appTree, options);

    const projectConfig = readProjectConfiguration(appTree, 'test-lib');
    const command =
      projectConfig.targets['release'].options.commands[0].command;
    expect(command).toContain('semantic-release');
    expect(command).toContain(
      '--extends=./packages/test-lib/release.config.js',
    );
  });

  it('should use the project release config template with correct values', async () => {
    await generator(appTree, options);

    const content = appTree.read(
      'packages/test-lib/release.config.js',
      'utf-8',
    );
    expect(content).toContain("'@scope/test-lib'");
    expect(content).toContain('dist/packages/test-lib');
  });

  it('should extend from release.config.base.js in project config', async () => {
    await generator(appTree, options);

    const content = appTree.read(
      'packages/test-lib/release.config.js',
      'utf-8',
    );
    expect(content).toContain('release.config.base.js');
    expect(content).toContain('extends');
  });
});
