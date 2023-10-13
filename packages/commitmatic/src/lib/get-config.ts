import { cosmiconfig } from 'cosmiconfig';
import { Config } from './normalize-config';

const moduleName = 'commitmatic';

export async function getUserConfig() {
  const config = await cosmiconfig(moduleName).search();
  return config?.config as Config;
}
