import * as getCommits from './get-commits';
import {
  gitRepo,
  gitCommits,
  gitDetachedHead,
} from '../../test/helpers/git-utils';
import { Context } from '@semantic-release-plus/core';

describe('get-commits', () => {
  const context: Partial<Context> = {};
  beforeEach(() => {
    // Stub the logger functions
    context.logger = { log: jest.fn(), error: jest.fn() };
  });

  test('Get all commits when there is no last release', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second'], { cwd });

    // Retrieve the commits with the commits module
    const result = await getCommits({
      cwd,
      lastRelease: {},
      logger: context.logger,
    });

    // Verify the commits created and retrieved by the module are identical
    expect(result.length).toBe(2);
    expect(result).toEqual(commits);
  });

  test('Get all commits since gitHead (from lastRelease)', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second', 'Third'], { cwd });

    // Retrieve the commits with the commits module, since commit 'First'
    const result = await getCommits({
      cwd,
      lastRelease: { gitHead: commits[commits.length - 1].hash },
      logger: context.logger,
    });

    // Verify the commits created and retrieved by the module are identical
    expect(result.length).toBe(2);
    expect(result).toEqual(commits.slice(0, 2));
  });

  test('Get all commits since gitHead (from lastRelease) on a detached head repo', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    let { cwd, repositoryUrl } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second', 'Third'], { cwd });
    // Create a detached head repo at commit 'feat: Second'
    cwd = await gitDetachedHead(repositoryUrl, commits[1].hash);

    // Retrieve the commits with the commits module, since commit 'First'
    const result = await getCommits({
      cwd,
      lastRelease: { gitHead: commits[commits.length - 1].hash },
      logger: context.logger,
    });

    // Verify the module retrieved only the commit 'feat: Second' (included in the detached and after 'fix: First')
    expect(result.length).toBe(1);
    expect(result[0].hash).toBe(commits[1].hash);
    expect(result[0].message).toBe(commits[1].message);
    expect(result[0].committerDate).toBeTruthy();
    expect(result[0].author.name).toBeTruthy();
    expect(result[0].committer.name).toBeTruthy();
  });

  test('Get all commits between lastRelease.gitHead and a shas', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second', 'Third'], { cwd });

    // Retrieve the commits with the commits module, between commit 'First' and 'Third'
    const result = await getCommits({
      cwd,
      lastRelease: { gitHead: commits[commits.length - 1].hash },
      nextRelease: { gitHead: commits[1].hash },
      logger: context.logger,
    });

    // Verify the commits created and retrieved by the module are identical
    expect(result.length).toBe(1);
    expect(result).toEqual(commits.slice(1, -1));
  });

  test('Return empty array if lastRelease.gitHead is the last commit', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second'], { cwd });

    // Retrieve the commits with the commits module, since commit 'Second' (therefore none)
    const result = await getCommits({
      cwd,
      lastRelease: { gitHead: commits[0].hash },
      logger: context.logger,
    });

    // Verify no commit is retrieved
    expect(result).toEqual([]);
  });

  test('Return empty array if there is no commits', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();

    // Retrieve the commits with the commits module
    const result = await getCommits({
      cwd,
      lastRelease: {},
      logger: context.logger,
    });

    // Verify no commit is retrieved
    expect(result).toEqual([]);
  });

  test('Get all commits under a path when there is no last release ', async () => {
    /**
     * FIXME: to be able to properly test this we will need to mock the git
     * repository differently so that we can add files to a commit during test
     * so that we have a consistent set of commits with file names that fall
     * under a path. Until then we are just verifying that we get a different
     * result than what we would expect if we were to not filter by path.
     * */

    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    await gitCommits(['First', 'Second'], { cwd });
    // Retrieve the commits with the commits module
    const result = await getCommits({
      cwd,
      lastRelease: {},
      logger: context.logger,
      options: { commitPaths: ['i/dont/exist/*', 'still/dont/exist/*'] },
    });

    // Verify the commits created and retrieved by the module are identical
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });

  // Test('Get all commits using commitPaths option ', async t => {
  //   /**
  //    * FIXME: to be able to properly test this we will need to mock the git
  //    * repository differently so that we can add files to a commit during test
  //    * so that we have a consistent set of commits with file names that fall
  //    * under a path. Until then we are just verifying that we get a different
  //    * result than what we would expect if we were to not filter by path.
  //    * */

  //   // Create a git repository, set the current working directory at the root of the repo
  //   const {cwd} = await gitRepo();
  //   // Add commits to the master branch
  //   const commits = await gitCommits(['First', 'Second'], {cwd});
  //   // Retrieve the commits with the commits module
  //   const result = await getCommits({
  //     cwd,
  //     lastRelease: {},
  //     logger: context.logger,
  //     options: {commitPaths: [`*`]},
  //   });

  //   console.log('commits:', commits);
  //   // Verify the commits created and retrieved by the module are identical
  //   console.log('result:', result);
  //   t.is(result.length, commits.length);
  //   t.deepEqual(result, commits);
  // });
});
