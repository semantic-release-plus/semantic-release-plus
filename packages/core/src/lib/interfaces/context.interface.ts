import { BranchType } from '../enums';

export interface Context {
  branch?: Branch;
  branches?: Branch[];
  commits?: Commit[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  envCi?: NodeJS.ProcessEnv;
  lastRelease?: Release;
  logger?: Logger;
  nextRelease?: Release;
  options?: Options;
  releases?: Release[];
  stdout?: NodeJS.WriteStream;
  stderr?: NodeJS.WriteStream;
}

export interface Options {
  tagFormat?: unknown;
  repositoryUrl?: unknown;
  branches?: unknown;
  publish?: boolean;
}

export interface Release {
  type?: BranchType | undefined;
  channel?: string;
  gitHead?: string;
  version?: string;
  gitTag?: string;
  notes?: string;
  name?: string;
}

export interface Logger {
  log?: (message: string) => void;
  error?: (message: string) => void;
  warn?: (message: string) => void;
  success?: (message: string) => void;
}

export interface Branch {
  channel: unknown;
  tags: unknown;
  type: unknown;
  name: unknown;
  range: unknown;
  accept: unknown;
  main: unknown;
}

export interface Commit {
  commit: {
    long: string;
    short: string;
  };
  tree: {
    long: string;
    short: string;
  };
  author: {
    name: string;
    email: string;
    date: Date;
  };
  commiter: {
    name: string;
    email: string;
    date: Date;
  };
  subject: string;
  body: string;
  hash: string;
  commiterDate: Date;
  message: string;
  gitTags: string;
}
