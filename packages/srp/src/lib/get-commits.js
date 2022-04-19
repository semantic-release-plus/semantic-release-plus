const debug = require('debug')('semantic-release:get-commits');
const { getCommits } = require('./git');
const { stronsole } = require('./stronsole');

/**
 * Retrieve the list of commits on the current branch since the commit sha associated with the last release, or all the commits of the current branch if there is no last released version.
 *
 * @param {Object} context semantic-release context.
 *
 * @return {Promise<Array<Object>>} The list of commits on the branch `branch` since the last release.
 */

module.exports = async ({
  cwd,
  env,
  lastRelease: { gitHead: from },
  nextRelease: { gitHead: to = 'HEAD' } = {},
  logger,
  options: { commitPaths } = {},
}) => {
  if (from) {
    debug('Use from: %s', from);
  } else {
    logger.log('No previous release found, retrieving all commits');
  }

  let paths = [];
  if (Array.isArray(commitPaths) && commitPaths.length > 0) {
    logger.log(
      'Commits are being filtered by the commitPaths property: %s',
      ...commitPaths
    );
    paths = ['--', ...commitPaths];
  }

  const commits = await getCommits(from, to, paths, { cwd, env });
  const commitsForDebug = commits.map((c) => ({
    short: c.commit?.short,
    tree: c.tree?.short,
    author: c.author?.name,
    committer: c.committer?.name,
    subject: c.subject,
    hash: c.hash,
    committerDate: c.committerDate,
    gitTags: c.getTags,
  }));
  logger.log(`Found ${commits.length} commits since last release`);
  debug('Parsed commits:\n\r%s', stronsole.table(commitsForDebug));
  return commits;
};
