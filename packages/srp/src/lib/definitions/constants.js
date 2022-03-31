const RELEASE_TYPE = ['patch', 'minor', 'major'];

const FIRST_RELEASE = '1.0.0';

const FIRSTPRERELEASE = '1';

const COMMIT_NAME = 'semantic-release-plus-bot';

const COMMIT_EMAIL = 'semantic-release-plus-bot@justindietz.com';

const RELEASE_NOTES_SEPARATOR = '\n\n';

const SECRET_REPLACEMENT = '[secure]';

const SECRET_MIN_SIZE = 5;

// !KEEP THIS - for backwards compatibility do not change this value
const GIT_NOTE_REF = 'semantic-release';

module.exports = {
  RELEASE_TYPE,
  FIRST_RELEASE,
  FIRSTPRERELEASE,
  COMMIT_NAME,
  COMMIT_EMAIL,
  RELEASE_NOTES_SEPARATOR,
  SECRET_REPLACEMENT,
  SECRET_MIN_SIZE,
  GIT_NOTE_REF,
};
