import { appRootPath } from '@nrwl/workspace/src/utils/app-root';
import { execSync } from 'child_process';
import { copySync, removeSync } from 'fs-extra';
import { getPublishableLibNames } from './utils';

console.log('\nUpdating local plugins...');

const publishableLibNames = getPublishableLibNames();

console.log(publishableLibNames);

execSync(`yarn nx run-many --target build --projects ${publishableLibNames}`);

removeSync(`${appRootPath}/node_modules/@semantic-release-plus`);

copySync(
  `${appRootPath}/dist/packages`,
  `${appRootPath}/node_modules/@semantic-release-plus`
);

console.log('\nUpdate complete.');
