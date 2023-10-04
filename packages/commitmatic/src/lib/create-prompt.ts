import { getGitCommitTemplate, getGitDiff } from './git-utils';
import { Config } from './normalize-config';

export function createPrompt(config: Config) {
  const { prompt, ignoreFiles, ignoreTemplate } = config;
  const diff = getGitDiff(ignoreFiles);
  const template = ignoreTemplate ? '' : getGitCommitTemplate();
  const message = [prompt, template, diff].filter(Boolean).join('\n\n');
  return message;
}
