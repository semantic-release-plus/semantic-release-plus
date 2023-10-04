import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export function getGitDiff(ignoreFiles: string[] = []) {
  const ignoreArgs = ignoreFiles.map((file) => `':!${file}'`).join(' ');
  const diffCommand = `git diff --cached -- ${ignoreArgs}`;
  console.log(diffCommand);
  return execSync(diffCommand).toString();
}

export function getGitCommitTemplate() {
  const templateCommand = 'git config commit.template';
  const templatePath = execSync(templateCommand).toString().trim();

  if (!templatePath) {
    return;
  } else {
    return readFileSync(templatePath, 'utf-8');
  }
}
