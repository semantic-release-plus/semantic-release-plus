const { template, escapeRegExp } = require('lodash');
const semver = require('semver');
const pReduce = require('p-reduce');
const debug = require('debug')('semantic-release-plus:get-tags');
const { getTags, getNote } = require('../git');
const { stronsole } = require('../stronsole');

module.exports = async (
  { cwd, env, gitNotesRef, options: { tagFormat } },
  branches
) => {
  // Generate a regex to parse tags formatted with `tagFormat`
  // by replacing the `version` variable in the template by `(.+)`.
  // The `tagFormat` is compiled with space as the `version` as it's an invalid tag character,
  // so it's guaranteed to no be present in the `tagFormat`.
  const tagRegexp = `^${escapeRegExp(
    template(tagFormat)({ version: ' ' })
  ).replace(' ', '(.+)')}`;

  return pReduce(
    branches,
    async (branches, branch) => {
      const branchTags = await pReduce(
        await getTags(branch.name, { cwd, env }),
        async (branchTags, tag) => {
          const [, version] = tag.match(tagRegexp) || [];
          return version && semver.valid(semver.clean(version))
            ? [
                ...branchTags,
                {
                  gitTag: tag,
                  version,
                  channels: (
                    await getNote({ commitish: tag, gitNotesRef }, { cwd, env })
                  ).channels || [null],
                },
              ]
            : branchTags;
        },
        []
      );
      debug(
        'found tags for branch %s:\n\r%s',
        branch.name,
        stronsole.table(branchTags)
      );
      return [...branches, { ...branch, tags: branchTags }];
    },
    []
  );
};