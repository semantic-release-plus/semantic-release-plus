import type { VerifyConditionsContext } from '@semantic-release-plus/core';
import { execSync } from 'child_process';
import type { PluginConfig } from './config.interface';
import { normalizeConfig } from './normalize-config';
import { status } from './status';
import AggregateError = require('aggregate-error');
import * as debugFactory from 'debug';

const debug = debugFactory(
  'semantic-release-plus:gitlab-terraform-module:verify-conditions',
);

export async function verifyConditions(
  pluginConfig: PluginConfig,
  context: VerifyConditionsContext,
) {
  debug('status:', status);
  const config = normalizeConfig(pluginConfig, context);

  const errors = [];

  if (!hasCurl()) {
    errors.push(new Error('curl must be installed'));
  }

  if (!config.gitlabApiUrl) {
    errors.push(
      new Error(
        'The "gitlabApiUrl" option or "CI_API_V4_URL" env variable is required',
      ),
    );
  }

  if (!config.gitlabProjectId) {
    errors.push(
      new Error(
        'The "gitlabProjectId" option or "CI_PROJECT_ID" env variable is required',
      ),
    );
  }

  if (!config.gitlabJobToken) {
    errors.push(
      new Error(
        'The "gitlabJobToken" option or "CI_JOB_TOKEN" env variable is required',
      ),
    );
  }
  if (!config.moduleName) {
    errors.push(new Error('The "moduleName" option is required'));
  }

  if (!config.moduleSystem) {
    errors.push(new Error('The "moduleSystem" option is required'));
  }

  if (!config.modulePath) {
    errors.push(new Error('The "modulePath" option is required'));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
  status.verified = true;
}

function hasCurl() {
  try {
    const result = execSync('curl --version');
    console.log(result.toString());
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
