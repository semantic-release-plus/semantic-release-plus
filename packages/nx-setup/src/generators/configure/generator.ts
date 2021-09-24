import {
  formatFiles,
  generateFiles,
  offsetFromRoot,
  readJson,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { detectPackageManager } from '@nrwl/tao/src/shared/package-manager';
import * as path from 'path';
import { ConfigureGeneratorSchema } from './schema';

interface NormalizedSchema extends ConfigureGeneratorSchema {
  projectName: string;
  projectRoot: string;
  releaseName: string;
  outputPath: string;
}

function normalizeOptions(
  host: Tree,
  options: ConfigureGeneratorSchema
): NormalizedSchema {
  const projectName = options.project;
  const projectConfig = readProjectConfiguration(host, projectName);
  const projectRoot = projectConfig.root;
  const outputPath = projectConfig.targets?.build?.options?.outputPath;
  const projectPackageJson = readJson(
    host,
    path.join(projectRoot, 'package.json')
  );
  const releaseName = projectPackageJson?.name;

  return {
    ...options,
    projectName,
    projectRoot,
    releaseName,
    outputPath,
  };
}

function addRootFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: '',
  };
  generateFiles(host, path.join(__dirname, 'root-files'), '', templateOptions);
}

function addProjectFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'project-files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (host: Tree, options: ConfigureGeneratorSchema) {
  const normalizedOptions = normalizeOptions(host, options);
  const projectConfig = readProjectConfiguration(
    host,
    normalizedOptions.projectName
  );
  const pm = detectPackageManager();
  const npxLikeCommand = {
    npm: 'npx',
    yarn: 'yarn',
    npx: 'pnpx',
  };

  projectConfig.targets['release'] = {
    executor: '@nrwl/workspace:run-commands',
    options: {
      commands: [
        {
          command: `${npxLikeCommand[pm]} semantic-release --extends=./${normalizedOptions.projectRoot}/release.config.js`,
        },
      ],
    },
  };
  updateProjectConfiguration(
    host,
    normalizedOptions.projectName,
    projectConfig
  );
  addRootFiles(host, normalizedOptions);
  addProjectFiles(host, normalizedOptions);
  await formatFiles(host);
}
