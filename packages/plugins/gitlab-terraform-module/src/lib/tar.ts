// Implement function that creates tar file from a directory similar to this bash command
// tar -vczf /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz -C ${TERRAFORM_MODULE_DIR} --exclude=./.git .

import { mkdir } from 'fs/promises';
import * as path from 'path';
import * as tar from 'tar';

export async function createTar({
  moduleName,
  modulePath,
}: {
  moduleName: string;
  modulePath: string;
}) {
  try {
    const outFilePath = path.join('./dist', `${moduleName}.tgz`);
    await mkdir(path.dirname(outFilePath), { recursive: true });
    await tar.create(
      {
        gzip: true,
        cwd: modulePath,
        file: outFilePath,
      },
      ['.'],
    );
    return outFilePath;
  } catch (err: any) {
    console.error('Failed to create tgz', err);
    throw err;
  }
}
