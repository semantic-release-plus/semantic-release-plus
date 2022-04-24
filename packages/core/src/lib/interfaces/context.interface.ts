import { BranchType } from '../enums';

export interface Context {
  branch: Branch;
  branches?: Branch[];
  commits?: Commit[];
  gitNotesRef?: string;
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
  tagFormat?: string;
  repositoryUrl?: string;
  branches?: unknown;
  publish?: boolean;
  dryRun?: boolean;
  noCi?: boolean;
  skipTag?: boolean;
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
  name: string;
  channel?: string;
  tags?: Tag[];
  type?: BranchType;
  range?: string;
  accept?: unknown;
  main?: unknown;
  mergeRange?: string;
}

export interface Tag {
  version: string;
  channel: string;
  channels: string[];
  gitTag: string;
  gitHead: string;
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
