import { BranchType } from '../enums';

export interface Context {
  branch?: any;
  branches?: any;
  commits?: any;
  cwd?: any;
  env?: any;
  envCi?: any;
  lastRelease?: any;
  logger?: Logger;
  nextRelease?: NextRelease;
  options?: Options;
  releases?: any;
  stdout?: any;
  stderr?: any;
}

export interface Options {
  tagFormat?: any;
  repositoryUrl?: any;
  branches?: any;
}

export interface NextRelease {
  type?: BranchType | undefined;
  version: string;
  channel?: string;
}

export interface Logger {
  log?: (message: string) => void;
  error?: (message: string) => void;
  warn?: (message: string) => void;
  success?: (message: string) => void;
}
