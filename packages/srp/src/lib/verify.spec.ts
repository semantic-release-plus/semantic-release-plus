import tempy = require('tempy');
import verify = require('./verify');
import { gitRepo } from '../../test/helpers/git-utils';

describe('verify', () => {
  test('Throw a AggregateError', async () => {
    const { cwd } = await gitRepo();
    const options = { branches: [{ name: 'master' }, { name: '' }] };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('ENOREPOURL');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
      expect(errors[1].name).toBe('SemanticReleaseError');
      expect(errors[1].code).toBe('EINVALIDTAGFORMAT');
      expect(errors[1].message).toBeTruthy();
      expect(errors[1].details).toBeTruthy();
      expect(errors[2].name).toBe('SemanticReleaseError');
      expect(errors[2].code).toBe('ETAGNOVERSION');
      expect(errors[2].message).toBeTruthy();
      expect(errors[2].details).toBeTruthy();
      expect(errors[3].name).toBe('SemanticReleaseError');
      expect(errors[3].code).toBe('EINVALIDBRANCH');
      expect(errors[3].message).toBeTruthy();
      expect(errors[3].details).toBeTruthy();
    }
  });

  test('Throw a SemanticReleaseError if does not run on a git repository', async () => {
    const cwd = tempy.directory();
    const options = { branches: [] };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('ENOGITREPO');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
    }
  });

  test('Throw a SemanticReleaseError if the "tagFormat" is not valid', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const options = { repositoryUrl, tagFormat: `?\${version}`, branches: [] };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('EINVALIDTAGFORMAT');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
    }
  });

  test('Throw a SemanticReleaseError if the "tagFormat" does not contains the "version" variable', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const options = { repositoryUrl, tagFormat: 'test', branches: [] };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('ETAGNOVERSION');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
    }
  });

  test('Throw a SemanticReleaseError if the "tagFormat" contains multiple "version" variables', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const options = {
      repositoryUrl,
      tagFormat: `\${version}v\${version}`,
      branches: [],
    };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('ETAGNOVERSION');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
    }
  });

  test('Throw a SemanticReleaseError for each invalid branch', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const options = {
      repositoryUrl,
      tagFormat: `v\${version}`,
      branches: [
        { name: '' },
        { name: '  ' },
        { name: 1 },
        {},
        { name: '' },
        1,
        'master',
      ],
    };

    try {
      await verify({ cwd, options });
      expect(true).toBe(false);
    } catch ([...errors]) {
      expect(errors[0].name).toBe('SemanticReleaseError');
      expect(errors[0].code).toBe('EINVALIDBRANCH');
      expect(errors[0].message).toBeTruthy();
      expect(errors[0].details).toBeTruthy();
      expect(errors[1].name).toBe('SemanticReleaseError');
      expect(errors[1].code).toBe('EINVALIDBRANCH');
      expect(errors[1].message).toBeTruthy();
      expect(errors[1].details).toBeTruthy();
      expect(errors[2].name).toBe('SemanticReleaseError');
      expect(errors[2].code).toBe('EINVALIDBRANCH');
      expect(errors[2].message).toBeTruthy();
      expect(errors[2].details).toBeTruthy();
      expect(errors[3].name).toBe('SemanticReleaseError');
      expect(errors[3].code).toBe('EINVALIDBRANCH');
      expect(errors[3].message).toBeTruthy();
      expect(errors[3].details).toBeTruthy();
      expect(errors[4].code).toBe('EINVALIDBRANCH');
      expect(errors[4].message).toBeTruthy();
      expect(errors[4].details).toBeTruthy();
      expect(errors[5].code).toBe('EINVALIDBRANCH');
      expect(errors[5].message).toBeTruthy();
      expect(errors[5].details).toBeTruthy();
    }
  });

  test('Return "true" if all verification pass', async () => {
    const { cwd, repositoryUrl } = await gitRepo(true);
    const options = {
      repositoryUrl,
      tagFormat: `v\${version}`,
      branches: [{ name: 'master' }],
    };

    await expect(verify({ cwd, options })).resolves.not.toThrow();
  });
});
