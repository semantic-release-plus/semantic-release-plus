// Implement function that creates tar file from a directory similar to this bash command
// tar -vczf /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz -C ${TERRAFORM_MODULE_DIR} --exclude=./.git .

import { mkdir } from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';
import * as tar from 'tar';

export async function createTar({
  moduleName,
  modulePath,
  include,
  exclude,
  outputDir,
}: {
  moduleName: string;
  modulePath: string;
  include: string[];
  exclude?: string[];
  outputDir: string;
}) {
  try {
    const outFile = path.join(outputDir, `${moduleName}.tgz`);
    await mkdir(path.dirname(outFile), { recursive: true });
    const includedFiles = await glob(include, {
      cwd: modulePath,
      nodir: true,
      ignore: exclude,
    });
    console.log({ includedFiles });
    console.log({ outFile });
    await tar.create(
      {
        gzip: true,
        cwd: modulePath,
        file: outFile,
      },
      includedFiles,
    );
    return outFile;
  } catch (err: any) {
    console.error('Failed to create tgz', err);
    throw err;
  }
}
