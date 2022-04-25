import * as getAuthUrl from './get-git-auth-url';
import { gitRepo } from '../../test/helpers/git-utils';

const env = { GIT_ASKPASS: 'echo', GIT_TERMINAL_PROMPT: 0 };

describe('get-git-auth-url', () => {
  test('Return the same "git" formatted URL if "gitCredentials" is not defined', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('git@host.null:owner/repo.git');
  });

  test('Return the same "https" formatted URL if "gitCredentials" is not defined', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: { repositoryUrl: 'https://host.null/owner/repo.git' },
      })
    ).toBe('https://host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is not defined and repositoryUrl is a "git+https" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: { repositoryUrl: 'git+https://host.null/owner/repo.git' },
      })
    ).toBe('https://host.null/owner/repo.git');
  });

  test('Do not add trailing ".git" if not present in the origian URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        vranch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo' },
      })
    ).toBe('git@host.null:owner/repo');
  });

  test('Handle "https" URL with group and subgroup', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'https://host.null/group/subgroup/owner/repo.git',
        },
      })
    ).toBe('https://host.null/group/subgroup/owner/repo.git');
  });

  test('Handle "git" URL with group and subgroup', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'git@host.null:group/subgroup/owner/repo.git',
        },
      })
    ).toBe('git@host.null:group/subgroup/owner/repo.git');
  });

  test('Convert shorthand URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'semantic-release-plus/semantic-release-plus',
        },
      })
    ).toBe(
      'https://github.com/semantic-release-plus/semantic-release-plus.git'
    );
  });

  test('Convert GitLab shorthand URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env,
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'gitlab:semantic-release-plus/semantic-release-plus',
        },
      })
    ).toBe(
      'https://gitlab.com/semantic-release-plus/semantic-release-plus.git'
    );
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://user:pass@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git" URL without user', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        options: {
          branch: 'master',
          repositoryUrl: 'host.null:owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git" URL without user and with a custom port', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        options: {
          branch: 'master',
          repositoryUrl: 'host.null:6666:owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null:6666/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git" URL without user and with a custom port followed by a slash', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        options: {
          branch: 'master',
          repositoryUrl: 'host.null:6666:/owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null:6666/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "https" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'https://host.null/owner/repo.git' },
      })
    ).toBe('https://user:pass@host.null/owner/repo.git');
  });

  test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "http" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'http://host.null/owner/repo.git' },
      })
    ).toBe('http://user:pass@host.null/owner/repo.git');
  });

  test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "http" URL with custom port', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        options: {
          branch: 'master',
          repositoryUrl: 'http://host.null:8080/owner/repo.git',
        },
      })
    ).toBe('http://user:pass@host.null:8080/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git+https" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git+https://host.null/owner/repo.git' },
      })
    ).toBe('https://user:pass@host.null/owner/repo.git');
  });

  test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git+http" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git+http://host.null/owner/repo.git' },
      })
    ).toBe('http://user:pass@host.null/owner/repo.git');
  });

  test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "ssh" URL', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        options: {
          branch: 'master',
          repositoryUrl: 'ssh://git@host.null:2222/owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "GH_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GH_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "GITHUB_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GITHUB_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "GL_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GL_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://gitlab-ci-token:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "GITLAB_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GITLAB_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://gitlab-ci-token:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "BB_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, BB_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://x-token-auth:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "BITBUCKET_TOKEN"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, BITBUCKET_TOKEN: 'token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://x-token-auth:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "BB_TOKEN_BASIC_AUTH"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, BB_TOKEN_BASIC_AUTH: 'username:token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://username:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "gitCredentials" is defined with "BITBUCKET_TOKEN_BASIC_AUTH"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, BITBUCKET_TOKEN_BASIC_AUTH: 'username:token' },
        branch: { name: 'master' },
        options: { repositoryUrl: 'git@host.null:owner/repo.git' },
      })
    ).toBe('https://username:token@host.null/owner/repo.git');
  });

  test('Return the "https" formatted URL if "GITHUB_ACTION" is set', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GITHUB_ACTION: 'foo', GITHUB_TOKEN: 'token' },
        options: {
          branch: 'master',
          repositoryUrl: 'git@host.null:owner/repo.git',
        },
      })
    ).toBe('https://x-access-token:token@host.null/owner/repo.git');
  });

  test('Handle "https" URL with group and subgroup, with "GIT_CREDENTIALS"', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'https://host.null/group/subgroup/owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null/group/subgroup/owner/repo.git');
  });

  test('Handle "git" URL with group and subgroup, with "GIT_CREDENTIALS', async () => {
    const { cwd } = await gitRepo();

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: {
          repositoryUrl: 'git@host.null:group/subgroup/owner/repo.git',
        },
      })
    ).toBe('https://user:pass@host.null/group/subgroup/owner/repo.git');
  });

  test('Do not add git credential to repositoryUrl if push is allowed', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);

    expect(
      await getAuthUrl({
        cwd,
        env: { ...env, GIT_CREDENTIALS: 'user:pass' },
        branch: { name: 'master' },
        options: { repositoryUrl },
      })
    ).toBe(repositoryUrl);
  });
});
