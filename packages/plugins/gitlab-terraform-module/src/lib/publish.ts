import type { PublishContext } from '@semantic-release-plus/core';
import type { PluginConfig } from './config.interface';
import { normalizeConfig } from './normalize-config';
import { status } from './status';
import { createTar } from './tar';
import { uploadTerraformModule } from './upload-terraform-module';
import { verifyConditions } from './verify-conditions';

export async function publish(
  pluginConfig: PluginConfig,
  context: PublishContext,
) {
  console.log({ STATUS: status });
  const config = normalizeConfig(pluginConfig, context);

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
  console.debug({
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

  const tarPath = await createTar({
    moduleName,
    modulePath,
    include,
    exclude,
    outputDir,
  });
  logger.success(`tgz created successfully at ${tarPath}`);

  if (!version) {
    throw new Error('next release version is undefined');
  }

  // Create a FormData object and append the file
  await uploadTerraformModule({
    tarPath,
    gitlabApiUrl,
    gitlabJobToken,
    gitlabProjectId,
    moduleName,
    moduleSystem,
    version,
  });
}
