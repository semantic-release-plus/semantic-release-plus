import { writeFileSync } from 'fs';
import { getGitDirectory } from './git-utils';

export function writeMsgToTempFile(
  message: string,
  filePath = `${getGitDirectory()}/COMMITMATIC_EDITMSG`,
) {
  writeFileSync(filePath, message);
}
