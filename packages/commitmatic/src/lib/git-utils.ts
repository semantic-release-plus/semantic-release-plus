import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export function getGitDiff(ignoreFiles: string[] = []) {
  const ignoreArgs = ignoreFiles.map((file) => `':!${file}'`).join(' ');
  const diffCommand = `git diff --cached -- ${ignoreArgs}`;
  // console.log(diffCommand);
  return execSync(diffCommand).toString();
}

export function getGitCommitTemplate() {
  let templatePath: string;
  try {
    templatePath = execSync('git config commit.template').toString().trim();
  } catch {
    // git config returns non-zero when the key is not set
    return;
  }

  if (!templatePath) {
    return;
  }

  return readFileSync(templatePath, 'utf-8');
}

export function getGitDirectory() {
  const gitDirectoryCommand = 'git rev-parse --git-dir';
  return execSync(gitDirectoryCommand).toString().trim();
}
