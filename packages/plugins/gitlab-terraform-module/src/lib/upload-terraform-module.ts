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
  // `--write-out` appends the HTTP status to stdout behind a unique marker so we
  // can assert the upload truly succeeded (2xx) rather than trusting curl's exit
  // code alone — curl can exit 0 on a redirect/unexpected body, which previously
  // would have been reported as a successful release.
  const statusMarker = '\nHTTP_STATUS:';
  const args = [
    '--fail-with-body',
    '--location',
    '--header',
    `JOB-TOKEN: ${gitlabJobToken}`,
    '--upload-file',
    tarPath,
    '--write-out',
    `${statusMarker}%{http_code}`,
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
    const statusCode = parseInt(result.slice(result.lastIndexOf(':') + 1), 10);
    if (statusCode < 200 || statusCode >= 300) {
      throw new SemanticReleaseError(
        `Failed to upload terraform module: unexpected HTTP status ${statusCode}`,
        'EUPLOADFAIL',
        result,
      );
    }
  } catch (error: any) {
    // Re-throw our own assertion error untouched; only wrap raw curl failures.
    if (error.semanticRelease) {
      context.logger.error(error.message);
      throw error;
    }
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
