import tempy = require('tempy');
import {
  getTagHead,
  isRefExists,
  fetch,
  getGitHead,
  repoUrl,
  tag,
  push,
  getTags,
  getBranches,
  isGitRepo,
  verifyTagName,
  isBranchUpToDate,
  getNote,
  addNote,
  fetchNotes,
} from './git';
import { gitNotesShow, gitAddNote } from './git-note-utils';
import {
  gitRepo,
  gitCommits,
  gitCheckout,
  gitTagVersion,
  gitShallowClone,
  gitGetCommits,
  gitAddConfig,
  gitCommitTag,
  gitRemoteTagHead,
  gitPush,
  gitDetachedHead,
  gitDetachedHeadFromBranch,
  gitFetch,
  initGit,
} from '../../test/helpers/git-utils';

const gitNotesRef = 'semantic-release-plus/v_';

describe('git', () => {
  test('Get the last commit sha', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    const result = await getGitHead({ cwd });

    expect(result).toBe(commits[0].hash);
  });

  test('Throw error if the last commit sha cannot be found', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();

    await expect(getGitHead({ cwd })).rejects.toThrow();
  });

  test('Unshallow and fetch repository', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    let { cwd, repositoryUrl } = await gitRepo();
    // Add commits to the master branch
    await gitCommits(['First', 'Second'], { cwd });
    // Create a shallow clone with only 1 commit
    cwd = await gitShallowClone(repositoryUrl);

    // Verify the shallow clone contains only one commit
    expect((await gitGetCommits(undefined, { cwd })).length).toBe(1);

    await fetch(repositoryUrl, 'master', 'master', { cwd });

    // Verify the shallow clone contains all the commits
    expect((await gitGetCommits(undefined, { cwd })).length).toBe(2);
  });

  test('Do not throw error when unshallow a complete repository', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd, repositoryUrl } = await gitRepo(true);
    await gitCommits(['First'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    await gitCheckout('second-branch', true, { cwd });
    await gitCommits(['Second'], { cwd });
    await gitPush(repositoryUrl, 'second-branch', { cwd });

    await expect(
      fetch(repositoryUrl, 'master', 'master', { cwd })
    ).resolves.not.toThrow();
    await expect(
      fetch(repositoryUrl, 'second-branch', 'master', { cwd })
    ).resolves.not.toThrow();
  });

  test('Fetch all tags on a detached head repository', async () => {
    let { cwd, repositoryUrl } = await gitRepo();

    await gitCommits(['First'], { cwd });
    await gitTagVersion('v1.0.0', undefined, { cwd });
    await gitCommits(['Second'], { cwd });
    await gitTagVersion('v1.0.1', undefined, { cwd });
    const [commit] = await gitCommits(['Third'], { cwd });
    await gitTagVersion('v1.1.0', undefined, { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    cwd = await gitDetachedHead(repositoryUrl, commit.hash);

    await fetch(repositoryUrl, 'master', 'master', { cwd });

    expect((await getTags('master', { cwd })).sort()).toEqual(
      ['v1.0.0', 'v1.0.1', 'v1.1.0'].sort()
    );
  });

  test('Fetch all tags on a repository with a detached head from branch (CircleCI)', async () => {
    let { cwd, repositoryUrl } = await gitRepo();

    await gitCommits(['First'], { cwd });
    await gitTagVersion('v1.0.0', undefined, { cwd });
    await gitCommits(['Second'], { cwd });
    await gitTagVersion('v1.0.1', undefined, { cwd });
    const [commit] = await gitCommits(['Third'], { cwd });
    await gitTagVersion('v1.1.0', undefined, { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    await gitCheckout('other-branch', true, { cwd });
    await gitPush(repositoryUrl, 'other-branch', { cwd });
    await gitCheckout('master', false, { cwd });
    await gitCommits(['Fourth'], { cwd });
    await gitTagVersion('v2.0.0', undefined, { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    cwd = await gitDetachedHeadFromBranch(
      repositoryUrl,
      'other-branch',
      commit.hash
    );

    await fetch(repositoryUrl, 'master', 'other-branch', { cwd });
    await fetch(repositoryUrl, 'other-branch', 'other-branch', { cwd });

    expect((await getTags('other-branch', { cwd })).sort()).toEqual(
      ['v1.0.0', 'v1.0.1', 'v1.1.0'].sort()
    );
    expect((await getTags('master', { cwd })).sort()).toEqual(
      ['v1.0.0', 'v1.0.1', 'v1.1.0', 'v2.0.0'].sort()
    );
  });

  test('Fetch all tags on a detached head repository with outdated cached repo (GitLab CI)', async () => {
    const { cwd, repositoryUrl } = await gitRepo();

    await gitCommits(['First'], { cwd });
    await gitTagVersion('v1.0.0', undefined, { cwd });
    await gitCommits(['Second'], { cwd });
    await gitTagVersion('v1.0.1', undefined, { cwd });
    let [commit] = await gitCommits(['Third'], { cwd });
    await gitTagVersion('v1.1.0', undefined, { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });

    // Create a clone (as first CI run would)
    const cloneCwd = await gitShallowClone(repositoryUrl);
    await gitFetch(repositoryUrl, { cwd: cloneCwd });
    await gitCheckout(commit.hash, false, { cwd: cloneCwd });

    // Push tag to remote
    [commit] = await gitCommits(['Fourth'], { cwd });
    await gitTagVersion('v1.2.0', undefined, { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });

    // Fetch on the cached repo and make detached head, leaving master outdated
    await fetch(repositoryUrl, 'master', 'master', { cwd: cloneCwd });
    await gitCheckout(commit.hash, false, { cwd: cloneCwd });

    expect((await getTags('master', { cwd: cloneCwd })).sort()).toEqual(
      ['v1.0.0', 'v1.0.1', 'v1.1.0', 'v1.2.0'].sort()
    );
  });

  test('Verify if a branch exists', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    await gitCommits(['First'], { cwd });
    // Create the new branch 'other-branch' from master
    await gitCheckout('other-branch', true, { cwd });
    // Add commits to the 'other-branch' branch
    await gitCommits(['Second'], { cwd });

    expect(await isRefExists('master', { cwd })).toBe(true);
    expect(await isRefExists('other-branch', { cwd })).toBe(true);
    expect(await isRefExists('next', { cwd })).toBeFalsy();
  });

  test('Get all branches', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    await gitCommits(['First'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    await gitCheckout('second-branch', true, { cwd });
    await gitCommits(['Second'], { cwd });
    await gitPush(repositoryUrl, 'second-branch', { cwd });
    await gitCheckout('third-branch', true, { cwd });
    await gitCommits(['Third'], { cwd });
    await gitPush(repositoryUrl, 'third-branch', { cwd });

    expect((await getBranches(repositoryUrl, { cwd })).sort()).toEqual(
      ['master', 'second-branch', 'third-branch'].sort()
    );
  });

  test('Return empty array if there are no branches', async () => {
    const { cwd, repositoryUrl } = await initGit(true);
    expect(await getBranches(repositoryUrl, { cwd })).toEqual([]);
  });

  test('Get the commit sha for a given tag', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });
    // Create the tag corresponding to version 1.0.0
    await gitTagVersion('v1.0.0', undefined, { cwd });

    expect(await getTagHead('v1.0.0', { cwd })).toBe(commits[0].hash);
  });

  test('Return git remote repository url from config', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add remote.origin.url config
    await gitAddConfig(
      'remote.origin.url',
      'git@hostname.com:owner/package.git',
      { cwd }
    );

    expect(await repoUrl({ cwd })).toBe('git@hostname.com:owner/package.git');
  });

  test('Return git remote repository url set while cloning', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    let { cwd, repositoryUrl } = await gitRepo();
    await gitCommits(['First'], { cwd });
    // Create a clone
    cwd = await gitShallowClone(repositoryUrl);

    expect(await repoUrl({ cwd })).toBe(repositoryUrl);
  });

  test('Return falsy if git repository url is not set', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();

    expect(await repoUrl({ cwd })).toBeFalsy();
  });

  test('Add tag on head commit', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    const commits = await gitCommits(['Test commit'], { cwd });

    await tag('tag_name', 'HEAD', { cwd });

    await expect(await gitCommitTag(commits[0].hash, { cwd })).toBe('tag_name');
  });

  test('Push tag to remote repository', async () => {
    // Create a git repository with a remote, set the current working directory at the root of the repo
    const { cwd, repositoryUrl } = await gitRepo(true);
    const commits = await gitCommits(['Test commit'], { cwd });

    await tag('tag_name', 'HEAD', { cwd });
    await push(repositoryUrl, { cwd });

    expect(await gitRemoteTagHead(repositoryUrl, 'tag_name', { cwd })).toBe(
      commits[0].hash
    );
  });

  test('Push tag to remote repository with remote branch ahead', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const commits = await gitCommits(['First'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    const temporaryRepo = await gitShallowClone(repositoryUrl);
    await gitCommits(['Second'], { cwd: temporaryRepo });
    await gitPush('origin', 'master', { cwd: temporaryRepo });

    await tag('tag_name', 'HEAD', { cwd });
    await push(repositoryUrl, { cwd });

    expect(await gitRemoteTagHead(repositoryUrl, 'tag_name', { cwd })).toBe(
      commits[0].hash
    );
  });

  test('Return "true" if in a Git repository', async () => {
    // Create a git repository with a remote, set the current working directory at the root of the repo
    const { cwd } = await gitRepo(true);

    expect(await isGitRepo({ cwd })).toBe(true);
  });

  test('Return falsy if not in a Git repository', async () => {
    const cwd = tempy.directory();

    expect(await isGitRepo({ cwd })).toBeFalsy();
  });

  test('Return "true" for valid tag names', async () => {
    expect(await verifyTagName('1.0.0')).toBe(true);
    expect(await verifyTagName('v1.0.0')).toBe(true);
    expect(await verifyTagName('tag_name')).toBe(true);
    expect(await verifyTagName('tag/name')).toBe(true);
  });

  test('Return falsy for invalid tag names', async () => {
    expect(await verifyTagName('?1.0.0')).toBeFalsy();
    expect(await verifyTagName('*1.0.0')).toBeFalsy();
    expect(await verifyTagName('[1.0.0]')).toBeFalsy();
    expect(await verifyTagName('1.0.0..')).toBeFalsy();
  });

  test('Throws error if obtaining the tags fails', async () => {
    const cwd = tempy.directory();

    await expect(getTags('master', { cwd })).rejects.toThrow();
  });

  test('Return "true" if repository is up to date', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    await gitCommits(['First'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });

    expect(await isBranchUpToDate(repositoryUrl, 'master', { cwd })).toBe(true);
  });

  test('Return falsy if repository is not up to date', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    await gitCommits(['First'], { cwd });
    await gitCommits(['Second'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });

    expect(await isBranchUpToDate(repositoryUrl, 'master', { cwd })).toBe(true);

    const temporaryRepo = await gitShallowClone(repositoryUrl);
    await gitCommits(['Third'], { cwd: temporaryRepo });
    await gitPush('origin', 'master', { cwd: temporaryRepo });

    expect(
      await isBranchUpToDate(repositoryUrl, 'master', { cwd })
    ).toBeFalsy();
  });

  test('Return falsy if detached head repository is not up to date', async () => {
    let { cwd, repositoryUrl } = await gitRepo();

    const [commit] = await gitCommits(['First'], { cwd });
    await gitCommits(['Second'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    cwd = await gitDetachedHead(repositoryUrl, commit.hash);
    await fetch(repositoryUrl, 'master', 'master', { cwd });

    expect(
      await isBranchUpToDate(repositoryUrl, 'master', { cwd })
    ).toBeFalsy();
  });

  test('Get a commit note', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    await gitAddNote(
      {
        note: JSON.stringify({ note: 'note' }),
        commitish: commits[0].hash,
        gitNotesRef,
      },
      { cwd }
    );

    expect(
      await getNote({ commitish: commits[0].hash, gitNotesRef }, { cwd })
    ).toEqual({
      note: 'note',
    });
  });

  test('Return empty object if there is no commit note', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    expect(
      await getNote({ commitish: commits[0].hash, gitNotesRef }, { cwd })
    ).toEqual({});
  });

  test('Throw error if a commit note in invalid', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    await gitAddNote(
      {
        note: 'non-json note',
        commitish: commits[0].hash,
        gitNotesRef,
      },
      { cwd }
    );

    await expect(
      getNote({ gitNotesRef, commitish: commits[0].hash }, { cwd })
    ).rejects.toThrow();
  });

  test('Add a commit note', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    await addNote(
      {
        note: { note: 'note' },
        commitish: commits[0].hash,
        gitNotesRef,
      },
      { cwd }
    );

    expect(
      await gitNotesShow({ commitish: commits[0].hash, gitNotesRef }, { cwd })
    ).toBe('{"note":"note"}');
  });

  test('Overwrite a commit note', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    const { cwd } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First'], { cwd });

    await addNote(
      {
        note: { note: 'note' },
        commitish: commits[0].hash,
        gitNotesRef,
      },
      { cwd }
    );
    await addNote(
      {
        note: { note: 'note2' },
        commitish: commits[0].hash,
        gitNotesRef,
      },
      { cwd }
    );
    expect(
      await gitNotesShow({ gitNotesRef, commitish: commits[0].hash }, { cwd })
    ).toBe('{"note":"note2"}');
  });

  test('Unshallow and fetch repository with notes', async () => {
    // Create a git repository, set the current working directory at the root of the repo
    let { cwd, repositoryUrl } = await gitRepo();
    // Add commits to the master branch
    const commits = await gitCommits(['First', 'Second'], { cwd });
    await gitAddNote(
      {
        gitNotesRef,
        note: JSON.stringify({ note: 'note' }),
        commitish: commits[0].hash,
      },
      { cwd }
    );
    // Create a shallow clone with only 1 commit
    cwd = await gitShallowClone(repositoryUrl);

    // Verify the shallow clone doesn't contains the note
    await expect(
      gitNotesShow({ commitish: commits[0].hash, gitNotesRef }, { cwd })
    ).rejects.toThrow();

    await fetch(repositoryUrl, 'master', 'master', { cwd });
    await fetchNotes({ repositoryUrl, gitNotesRef }, { cwd });

    // Verify the shallow clone contains the note
    expect(
      await gitNotesShow({ commitish: commits[0].hash, gitNotesRef }, { cwd })
    ).toBe('{"note":"note"}');
  });

  test('Fetch all notes on a detached head repository', async () => {
    let { cwd, repositoryUrl } = await gitRepo();

    await gitCommits(['First'], { cwd });
    const [commit] = await gitCommits(['Second'], { cwd });
    await gitPush(repositoryUrl, 'master', { cwd });
    await gitAddNote(
      {
        note: JSON.stringify({ note: 'note' }),
        commitish: commit.hash,
        gitNotesRef,
      },
      { cwd }
    );
    cwd = await gitDetachedHead(repositoryUrl, commit.hash);

    await fetch(repositoryUrl, 'master', 'master', { cwd });
    await fetchNotes({ repositoryUrl, gitNotesRef }, { cwd });

    expect(
      await gitNotesShow({ commitish: commit.hash, gitNotesRef }, { cwd })
    ).toBe('{"note":"note"}');
  });
});
