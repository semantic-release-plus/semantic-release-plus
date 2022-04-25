import * as getReleaseToAdd from './get-release-to-add';

describe('get-release-to-add', () => {
  test('Return versions merged from release to maintenance branch, excluding lower than branch start range', () => {
    const result = getReleaseToAdd({
      branch: {
        name: '2.x',
        channel: '2.x',
        type: 'maintenance',
        mergeRange: '>=2.0.0 <3.0.0',
        tags: [
          { gitTag: 'v2.0.0', version: '2.0.0', channels: ['2.x'] },
          { gitTag: 'v2.0.0', version: '2.0.0', channels: [null] },
          { gitTag: 'v2.1.0', version: '2.1.0', channels: [null] },
          { gitTag: 'v2.1.1', version: '2.1.1', channels: [null] },
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: [null] },
        ],
      },
      branches: [{ name: '2.x', channel: '2.x' }, { name: 'master' }],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toEqual({
      lastRelease: {
        version: '2.1.0',
        channels: [null],
        gitTag: 'v2.1.0',
        name: 'v2.1.0',
        gitHead: 'v2.1.0',
      },
      currentRelease: {
        type: 'patch',
        version: '2.1.1',
        channels: [null],
        gitTag: 'v2.1.1',
        name: 'v2.1.1',
        gitHead: 'v2.1.1',
      },
      nextRelease: {
        type: 'patch',
        version: '2.1.1',
        channel: '2.x',
        gitTag: 'v2.1.1',
        name: 'v2.1.1',
        gitHead: 'v2.1.1',
      },
    });
  });

  test('Return versions merged between release branches', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        tags: [
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null, 'next'] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: ['next'] },
          { gitTag: 'v2.0.0', version: '2.0.0', channels: ['next-major'] },
        ],
      },
      branches: [
        { name: 'master' },
        { name: 'next', channel: 'next' },
        { name: 'next-major', channel: 'next-major' },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toEqual({
      lastRelease: {
        version: '1.1.0',
        gitTag: 'v1.1.0',
        name: 'v1.1.0',
        gitHead: 'v1.1.0',
        channels: ['next'],
      },
      currentRelease: {
        type: 'major',
        version: '2.0.0',
        channels: ['next-major'],
        gitTag: 'v2.0.0',
        name: 'v2.0.0',
        gitHead: 'v2.0.0',
      },
      nextRelease: {
        type: 'major',
        version: '2.0.0',
        channel: null,
        gitTag: 'v2.0.0',
        name: 'v2.0.0',
        gitHead: 'v2.0.0',
      },
    });
  });

  test('Return releases sorted by ascending order', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        tags: [
          { gitTag: 'v2.0.0', version: '2.0.0', channels: ['next-major'] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: ['next'] },
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null, 'next'] },
        ],
      },
      branches: [
        { name: 'master' },
        { name: 'next', channel: 'next' },
        { name: 'next-major', channel: 'next-major' },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toEqual({
      lastRelease: {
        version: '1.1.0',
        gitTag: 'v1.1.0',
        name: 'v1.1.0',
        gitHead: 'v1.1.0',
        channels: ['next'],
      },
      currentRelease: {
        type: 'major',
        version: '2.0.0',
        channels: ['next-major'],
        gitTag: 'v2.0.0',
        name: 'v2.0.0',
        gitHead: 'v2.0.0',
      },
      nextRelease: {
        type: 'major',
        version: '2.0.0',
        channel: null,
        gitTag: 'v2.0.0',
        name: 'v2.0.0',
        gitHead: 'v2.0.0',
      },
    });
  });

  test('No lastRelease', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        tags: [{ gitTag: 'v1.0.0', version: '1.0.0', channels: ['next'] }],
      },
      branches: [{ name: 'master' }, { name: 'next', channel: 'next' }],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toEqual({
      lastRelease: {},
      currentRelease: {
        type: 'major',
        version: '1.0.0',
        channels: ['next'],
        gitTag: 'v1.0.0',
        name: 'v1.0.0',
        gitHead: 'v1.0.0',
      },
      nextRelease: {
        type: 'major',
        version: '1.0.0',
        channel: null,
        gitTag: 'v1.0.0',
        name: 'v1.0.0',
        gitHead: 'v1.0.0',
      },
    });
  });

  test('Ignore pre-release versions', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        tags: [
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null, 'next'] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: ['next'] },
          {
            gitTag: 'v2.0.0-alpha.1',
            version: '2.0.0-alpha.1',
            channels: ['alpha'],
          },
        ],
      },
      branches: [
        { name: 'master' },
        { name: 'next', channel: 'next' },
        { name: 'alpha', type: 'prerelease', channel: 'alpha' },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toEqual({
      lastRelease: {
        version: '1.0.0',
        channels: [null, 'next'],
        gitTag: 'v1.0.0',
        name: 'v1.0.0',
        gitHead: 'v1.0.0',
      },
      currentRelease: {
        type: 'minor',
        version: '1.1.0',
        channels: ['next'],
        gitTag: 'v1.1.0',
        name: 'v1.1.0',
        gitHead: 'v1.1.0',
      },
      nextRelease: {
        type: 'minor',
        version: '1.1.0',
        channel: null,
        gitTag: 'v1.1.0',
        name: 'v1.1.0',
        gitHead: 'v1.1.0',
      },
    });
  });

  test('Exclude versions merged from release to maintenance branch if they have the same "channel"', () => {
    const result = getReleaseToAdd({
      branch: {
        name: '2.x',
        channel: 'latest',
        type: 'maintenance',
        mergeRange: '>=2.0.0 <3.0.0',
        tags: [
          { gitTag: 'v2.0.0', version: '2.0.0', channels: [null] },
          { gitTag: 'v2.0.0', version: '2.0.0', channels: [null] },
          { gitTag: 'v2.1.0', version: '2.1.0', channels: [null] },
          { gitTag: 'v2.1.1', version: '2.1.1', channels: [null] },
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: [null] },
        ],
      },
      branches: [
        { name: '2.x', channel: 'latest' },
        { name: 'master', channel: 'latest' },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toBe(undefined);
  });

  test('Exclude versions merged between release branches if they have the same "channel"', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        channel: 'latest',
        tags: [
          { gitTag: 'v1.0.0', channels: ['latest'], version: '1.0.0' },
          { gitTag: 'v1.1.0', channels: ['latest'], version: '1.1.0' },
          { gitTag: 'v2.0.0', channels: ['latest'], version: '2.0.0' },
        ],
      },
      branches: [
        { name: 'master', channel: 'latest' },
        { name: 'next', channel: 'latest' },
        { name: 'next-major', channel: 'latest' },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toBe(undefined);
  });

  test('Exclude versions merged between release branches if they all have "channel" set to "false"', () => {
    const result = getReleaseToAdd({
      branch: {
        name: 'master',
        channel: false,
        tags: [
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: [null] },
          { gitTag: 'v2.0.0', version: '2.0.0', channels: [null] },
        ],
      },
      branches: [
        { name: 'master', channel: false },
        { name: 'next', channel: false },
        { name: 'next-major', channel: false },
      ],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toBe(undefined);
  });

  test('Exclude versions number less than the latest version already released on that branch', () => {
    const result = getReleaseToAdd({
      branch: {
        name: '2.x',
        channel: '2.x',
        type: 'maintenance',
        mergeRange: '>=2.0.0 <3.0.0',
        tags: [
          { gitTag: 'v2.0.0', version: '2.0.0', channels: ['2.x'] },
          { gitTag: 'v2.0.0', version: '2.0.0', channels: [null] },
          { gitTag: 'v2.1.0', version: '2.1.0', channels: [null] },
          { gitTag: 'v2.1.1', version: '2.1.1', channels: [null, '2.x'] },
          { gitTag: 'v1.0.0', version: '1.0.0', channels: [null] },
          { gitTag: 'v1.1.0', version: '1.1.0', channels: [null] },
        ],
      },
      branches: [{ name: '2.x', channel: '2.x' }, { name: 'master' }],
      options: { tagFormat: `v\${version}` },
    });

    expect(result).toBe(undefined);
  });
});
