import { BranchType } from '../enums';

export interface CommonContext {
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
  logger: Logger;
  gitNotesRef?: string;
}

export interface VerifyConditionsContext extends CommonContext {
  cwd: string;
  env: NodeJS.ProcessEnv;
  envCi: {
    isCi: boolean;
    commit: string;
    branch: string;
    [key: string]: unknown;
  };
  options: Options;
  branch: Branch;
  branches: Branch[];
}

export interface AnalyzeCommitsContext extends VerifyConditionsContext {
  commits: Commit[];
  releases: Release[];
  lastRelease: Release;
}

export interface VerifyReleaseContext extends AnalyzeCommitsContext {
  nextRelease: Release;
}

export type GenerateNotesContext = VerifyReleaseContext;

export type PrepareContext = GenerateNotesContext;

export type PublishContext = PrepareContext;

export type SuccessContext = PublishContext;

export interface FailContext extends PublishContext {
  errors: Error[];
}

export type AnyLifecycleContext =
  | VerifyConditionsContext
  | AnalyzeCommitsContext
  | VerifyReleaseContext
  | GenerateNotesContext
  | PrepareContext
  | PublishContext
  | SuccessContext
  | FailContext;

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

interface Options {
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

interface Logger {
  log: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  success: (message: string) => void;
}

interface Branch {
  name: string;
  channel?: string;
  tags?: Tag[];
  type?: BranchType;
  range?: string;
  accept?: unknown;
  main?: unknown;
  mergeRange?: string;
}

interface Tag {
  version: string;
  channel: string;
  channels: string[];
  gitTag: string;
  gitHead: string;
}

interface Commit {
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
