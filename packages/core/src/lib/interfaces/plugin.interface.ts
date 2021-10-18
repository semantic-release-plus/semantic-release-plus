import { Context } from '../interfaces';

export interface Plugin<T = Record<string, unknown>> {
  verifyConditions?: (pluginConfig: T, context: Context) => Promise<void>;
  generateNotes?: (pluginConfig: T, context: Context) => Promise<any>; //TODO: figure out notes interface
  addChannel?: (pluginConfig: T, context: Context) => Promise<any>; //TODO: figure out releases interface
  analyzeCommits?: (pluginConfig: T, context: Context) => Promise<any>; //TODO: figure out type interface
  verifyRelease?: (pluginConfig: T, context: Context) => Promise<void>;
  prepare?: (pluginConfig: T, context: Context) => Promise<void>;
  publish?: (pluginConfig: T, context: Context) => Promise<any>; //TODO: figure out releases interface
  success?: (pluginConfig: T, context: Context) => Promise<void>;
  fail?: (pluginConfig: T, context: Context) => Promise<void>;
}
