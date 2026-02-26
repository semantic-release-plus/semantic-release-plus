import { PublishContext } from '@semantic-release-plus/core';
import { SemanticReleaseError } from '@semantic-release-plus/error';
import { execFileSync } from 'child_process';
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
  const url = `${gitlabApiUrl}/projects/${gitlabProjectId}/packages/terraform/modules/${moduleName}/${moduleSystem}/${version}/file`;
  const args = [
    '--fail-with-body',
    '--location',
    '--header',
    `JOB-TOKEN: ${gitlabJobToken}`,
    '--upload-file',
    tarPath,
    url,
  ];
  debug(
    'curl %o',
    args.map((a) =>
      a.includes(gitlabJobToken) ? a.replace(gitlabJobToken, '[REDACTED]') : a,
    ),
  );
  try {
    const result = execFileSync('curl', args).toString();
    debug(result);
  } catch (error: any) {
    const { logger } = context;
    logger.error(`Command failed with error: ${error.message}`);
    if (error.stdout) {
      logger.error(`Standard Output: ${error.stdout.toString()}`);
    }
    if (error.stderr) {
      logger.error(`Standard Error: ${error.stderr.toString()}`);
    }
    throw new SemanticReleaseError(
      `Failed to upload terraform module: ${error.message}`,
      'EUPLOADFAIL',
      error.stderr ? error.stderr.toString() : error.message,
    );
  }
}
