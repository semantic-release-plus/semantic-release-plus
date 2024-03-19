import type { PublishContext } from '@semantic-release-plus/core';
import type { PluginConfig } from './config.interface';
import { normalizeConfig } from './normalize-config';
import { status } from './status';
import { createTar } from './tar';
import { uploadTerraformModule } from './upload-terraform-module';
import { verifyConditions } from './verify-conditions';
import * as debugFactory from 'debug';

const debug = debugFactory(
  'semantic-release-plus:gitlab-terraform-module:publish',
);

export async function publish(
  pluginConfig: PluginConfig,
  context: PublishContext,
) {
  const config = normalizeConfig(pluginConfig, context);
  debug('status:', status);
  if (!status.verified) {
    verifyConditions(config, context);
  }

  const {
    gitlabApiUrl,
    gitlabJobToken,
    gitlabProjectId,
    moduleName,
    modulePath,
    moduleSystem,
    include,
    exclude,
    outputDir,
  } = config;

  const version = context.nextRelease?.version;
  const logger = context.logger;
  debug({
    gitlabApiUrl,
    gitlabJobToken,
    gitlabProjectId,
    moduleName,
    modulePath,
    moduleSystem,
    include,
    exclude,
    version,
    outputDir,
  });

  const tarPath = await createTar(
    {
      moduleName,
      modulePath,
      include,
      exclude,
      outputDir,
    },
    context,
  );
  logger.log(`tgz created successfully at ${tarPath}`);

  if (!version) {
    throw new Error('next release version is undefined');
  }

  // Create a FormData object and append the file
  await uploadTerraformModule(
    {
      tarPath,
      gitlabApiUrl,
      gitlabJobToken,
      gitlabProjectId,
      moduleName,
      moduleSystem,
      version,
    },
    context,
  );
  logger.success(
    `Terraform module published successfully ${context.nextRelease.gitTag}`,
  );
}
