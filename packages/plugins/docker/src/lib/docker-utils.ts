import { Context } from '@semantic-release-plus/core';
import * as execa from 'execa';

export async function dockerLogin(
  {
    userName,
    password,
    registry = '',
  }: { userName: string; password: string; registry?: string },
  { cwd, env, stdout, stderr }: Context
) {
  const result = execa(
    'docker',
    ['login', registry, '--username', userName, '--password-stdin'],
    { input: password, env, cwd }
  );
  // result.stdout.pipe(stdout, { end: false });
  // result.stderr.pipe(stderr, { end: false });

  return await result;
}

export async function dockerTag(
  name: string,
  tag: string,
  { cwd, env, stdout, stderr }: Context
) {
  const result = execa('docker', ['tag', name, tag], { cwd, env });

  // result.stdout.pipe(stdout, { end: false });
  // result.stderr.pipe(stderr, { end: false });
  return await result;
}

export async function dockerPull(
  tag: string,
  { cwd, env, stdout, stderr }: Context
) {
  const result = execa('docker', ['pull', tag], { cwd, env });
  // result.stdout.pipe(stdout, { end: false });
  // result.stderr.pipe(stderr, { end: false });
  return await result;
}

export async function dockerPush(
  tag: string,
  { cwd, env, stdout, stderr }: Context
) {
  const result = execa('docker', ['push', tag], { cwd, env });
  // result.stdout.pipe(stdout, { end: false });
  // result.stderr.pipe(stderr, { end: false });
  return await result;
}
