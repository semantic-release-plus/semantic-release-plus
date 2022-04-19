// A set of pure functions that do not rely on any semantic-release-globals that wraps some of the standard git action
const execa = require('execa');
const debug = require('debug')('semantic-release:git-note-utils');
const template = require('lodash/template');
const { GIT_NOTE_REF } = require('./definitions/constants');

function getGitNotesRef(tagFormat, gitNotesRef = GIT_NOTE_REF) {
  const sanitizedTagFormat = template(tagFormat)({ version: '_' });
  const sanitizedGitNotesRef = `${gitNotesRef}/${sanitizedTagFormat}`;
  debug(`notes ref: ${sanitizedGitNotesRef}`);
  return sanitizedGitNotesRef;
}

async function gitNotesShow({ gitNotesRef, commitish }, execaOptions) {
  const { stdout, escapedCommand } = await execa(
    'git',
    ['notes', '--ref', gitNotesRef, 'show', commitish],
    execaOptions
  );
  debug(escapedCommand);
  debug(stdout);
  return stdout;
}

async function gitFetchNotes({ repositoryUrl, gitNotesRef }, execaOptions) {
  try {
    return await execa(
      'git',
      [
        'fetch',
        '--unshallow',
        repositoryUrl,
        `+refs/notes/${gitNotesRef}:refs/notes/${gitNotesRef}`,
      ],
      execaOptions
    );
  } catch {
    return await execa(
      'git',
      [
        'fetch',
        repositoryUrl,
        `+refs/notes/${gitNotesRef}:refs/notes/${gitNotesRef}`,
      ],
      {
        ...execaOptions,
        reject: false,
      }
    );
  }
}

async function gitAddNote(
  { gitNotesRef, note, commitish, overwrite = false },
  execaOptions
) {
  const gitNoteAddArgs = [
    'notes',
    '--ref',
    gitNotesRef,
    'add',
    '-m',
    note,
    commitish,
  ];
  if (overwrite) {
    gitNoteAddArgs.push('-f');
  }
  await execa('git', gitNoteAddArgs, execaOptions);
}

async function gitPushNotes({ repositoryUrl, gitNotesRef }, execaOptions) {
  return await execa(
    'git',
    ['push', repositoryUrl, `refs/notes/${gitNotesRef}`],
    execaOptions
  );
}

module.exports = {
  gitNotesShow,
  gitFetchNotes,
  gitPushNotes,
  gitAddNote,
  getGitNotesRef,
};
