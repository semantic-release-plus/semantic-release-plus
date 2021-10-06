import { Context } from '@semantic-release-plus/core';
import execa = require('execa');

export function dockerLogin(
  {
    userName,
    password,
    registry = '',
  }: { userName: string; password: string; registry?: string },
  { cwd, env }: Context
) {
  return execa(
    'docker',
    ['login', registry, '--username', userName, '--password-stdin'],
    {
      input: password,
      env,
      cwd,
    }
  );
}

export function dockerTag(name: string, tag: string, { cwd, env }: Context) {
  return execa('docker', ['tag', name, tag], { cwd, env });
}

export function dockerPull(tag: string, { cwd, env }: Context) {
  return execa('docker', ['pull', tag], { cwd, env });
}

export function dockerPush(tag: string, { cwd, env }: Context) {
  return execa('docker', ['push', tag], { cwd, env });
}
