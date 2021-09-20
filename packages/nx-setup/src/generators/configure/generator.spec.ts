import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { libraryGenerator } from '@nrwl/workspace/generators';
import generator from './generator';
import { ConfigureGeneratorSchema } from './schema';

describe('configure generator', () => {
  let appTree: Tree;
  const options: ConfigureGeneratorSchema = { project: 'test-lib' };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace();
    await libraryGenerator(appTree, {
      name: 'test-lib',
    });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);

    expect(appTree.exists('release.config.base.js')).toBeTruthy();
    const projectConfig = readProjectConfiguration(appTree, 'test-lib');

    console.log(JSON.stringify(projectConfig, null, 2));
  });

  // it('should create release.config.base.js', async () => {
  //   await generator(appTree, {
  //     project: 'test-lib',
  //   });
  // });
});
