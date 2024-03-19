import { PublishContext } from '@semantic-release-plus/core';
import { execSync } from 'child_process';
import * as debugFactory from 'debug';

const debug = debugFactory(
  'semantic-release-plus:gitlab-terraform-module:upload-terraform-module',
);

export async function uploadTerraformModule(
  {
    tarPath,
    gitlabApiUrl,
    gitlabProjectId,
    moduleName,
    moduleSystem,
    version,
    gitlabJobToken,
  }: {
    tarPath: string;
    gitlabApiUrl: string;
    gitlabProjectId: string;
    moduleName: string;
    moduleSystem: string;
    version: string;
    gitlabJobToken: string;
  },
  context: PublishContext,
) {
  // 'curl --fail-with-body --location --header "JOB-TOKEN: ${CI_JOB_TOKEN}"
  //        --upload-file /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz
  //        ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/terraform/modules/${TERRAFORM_MODULE_NAME}/${TERRAFORM_MODULE_SYSTEM}/${TERRAFORM_MODULE_VERSION}/file'

  const curlCmd = `curl --fail-with-body --location --header "JOB-TOKEN: ${gitlabJobToken}" --upload-file ${tarPath} ${gitlabApiUrl}/projects/${gitlabProjectId}/packages/terraform/modules/${moduleName}/${moduleSystem}/${version}/file`;
  debug(curlCmd);
  try {
    const result = execSync(curlCmd).toString();
    debug(result);
  } catch (error: any) {
    const { logger } = context;
    logger.error(`Command failed with error: ${error.message}`);
    // Optional: use error.stdout or error.stderr if needed
    if (error.stdout) {
      logger.error(`Standard Output: ${error.stdout.toString()}`);
    }
    if (error.stderr) {
      logger.error(`Standard Error: ${error.stderr.toString()}`);
    }
  }
}
