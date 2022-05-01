import { escapeRegExp } from 'lodash';
import { SECRET_REPLACEMENT } from '../src/lib/definitions/constants';

// TODO: Refactor to isolate this so it's only testing cli
describe('cli', () => {
  let originalArgv: string[];
  const indexMock = jest.fn();
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  // const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();

  beforeEach(() => {
    jest.mock('./index', () => indexMock);
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
  });

  afterEach(() => {
    jest.resetAllMocks();

    // Set process arguments back to the original value
    process.argv = originalArgv;
  });
  test('Pass options to semantic-release-plus API', async () => {
    const testArgs = [
      '-b',
      'master',
      'next',
      '-r',
      'https://github/com/owner/repo.git',
      '-t',
      `v\${version}`,
      '-p',
      'plugin1',
      'plugin2',
      '-e',
      'config1',
      'config2',
      '--verify-conditions',
      'condition1',
      'condition2',
      '--analyze-commits',
      'analyze',
      '--verify-release',
      'verify1',
      'verify2',
      '--generate-notes',
      'notes',
      '--prepare',
      'prepare1',
      'prepare2',
      '--publish',
      'publish1',
      'publish2',
      '--success',
      'success1',
      'success2',
      '--fail',
      'fail1',
      'fail2',
      '--debug',
      '-d',
    ];

    const exitCode = await runCommand(testArgs);
    expect(indexMock).toBeCalledWith(
      expect.objectContaining({
        branches: ['master', 'next'],
        repositoryUrl: 'https://github/com/owner/repo.git',
        tagFormat: `v\${version}`,
        plugins: ['plugin1', 'plugin2'],
        extends: ['config1', 'config2'],
        verifyConditions: ['condition1', 'condition2'],
        analyzeCommits: 'analyze',
        verifyRelease: ['verify1', 'verify2'],
        generateNotes: ['notes'],
        prepare: ['prepare1', 'prepare2'],
        publish: ['publish1', 'publish2'],
        success: ['success1', 'success2'],
        fail: ['fail1', 'fail2'],
        debug: true,
        dryRun: true,
      })
    );
    expect(exitCode).toBe(0);
  });

  test('Pass options to semantic-release-plus API with alias arguments', async () => {
    const testArgs = [
      '--branches',
      'master',
      '--repository-url',
      'https://github/com/owner/repo.git',
      '--tag-format',
      `v\${version}`,
      '--plugins',
      'plugin1',
      'plugin2',
      '--extends',
      'config1',
      'config2',
      '--dry-run',
    ];

    const exitCode = await runCommand(testArgs);
    expect(indexMock).toBeCalledWith(
      expect.objectContaining({
        branches: ['master'],
        repositoryUrl: 'https://github/com/owner/repo.git',
        tagFormat: `v\${version}`,
        plugins: ['plugin1', 'plugin2'],
        extends: ['config1', 'config2'],
        dryRun: true,
      })
    );
    expect(exitCode).toBe(0);
  });

  test('Pass unknown options to semantic-release-plus API', async () => {
    const testArgs = [
      '--bool',
      '--first-option',
      'value1',
      '--second-option',
      'value2',
      '--second-option',
      'value3',
    ];

    const exitCode = await runCommand(testArgs);

    expect(indexMock).toBeCalledWith(
      expect.objectContaining({
        bool: true,
        firstOption: 'value1',
        secondOption: ['value2', 'value3'],
      })
    );

    expect(exitCode).toBe(0);
  });

  test('Pass empty Array to semantic-release-plus API for list option set to "false"', async () => {
    const testArgs = ['--publish', 'false'];

    const exitCode = await runCommand(testArgs);

    expect(indexMock).toBeCalledWith(
      expect.objectContaining({
        publish: [],
      })
    );

    expect(exitCode).toBe(0);
  });

  test('Do not set properties in option for which arg is not in command line', async () => {
    const testArgs = ['-b', 'master'];

    await runCommand(testArgs);

    expect('ci' in indexMock.mock.calls[0][0]).toBe(false);
    expect('d' in indexMock.mock.calls[0][0]).toBe(false);
    expect('dry-run' in indexMock.mock.calls[0][0]).toBe(false);
    expect('debug' in indexMock.mock.calls[0][0]).toBe(false);
    expect('r' in indexMock.mock.calls[0][0]).toBe(false);
    expect('t' in indexMock.mock.calls[0][0]).toBe(false);
    expect('p' in indexMock.mock.calls[0][0]).toBe(false);
    expect('e' in indexMock.mock.calls[0][0]).toBe(false);
  });

  test('Display help', async () => {
    const testArgs = ['--help'];

    const exitCode = await runCommand(testArgs);

    expect(consoleLogSpy).toBeCalledWith(
      expect.stringMatching(/Run automated package publishing/)
    );
    expect(exitCode).toBe(0);
  });

  test('Return error exitCode and prints help if called with a command', async () => {
    const testArgs = ['pre'];

    const exitCode = await runCommand(testArgs);

    expect(consoleErrorSpy).toBeCalledWith(
      expect.stringMatching(/Run automated package publishing/)
    );
    expect(consoleErrorSpy).toBeCalledWith(
      expect.stringMatching(/Too many non-option arguments/)
    );
    expect(exitCode).toBe(1);
  });

  test('Return error exitCode if multiple plugin are set for single plugin', async () => {
    indexMock.mockResolvedValue(true);
    const testArgs = ['--analyze-commits', 'analyze1', 'analyze2'];

    const exitCode = await runCommand(testArgs);

    expect(consoleErrorSpy).toBeCalledWith(
      expect.stringMatching(/Run automated package publishing/)
    );
    expect(consoleErrorSpy).toBeCalledWith(
      expect.stringMatching(/Too many non-option arguments/)
    );
    expect(exitCode).toBe(1);
  });

  test('Return error exitCode if semantic-release-plus throw error', async () => {
    indexMock.mockRejectedValue(new Error('semantic-release-plus error'));
    const testArgs = [];

    const exitCode = await runCommand(testArgs);

    expect(stderrSpy).toBeCalledWith(
      expect.stringMatching(/semantic-release-plus error/)
    );

    expect(exitCode).toBe(1);
  });

  test('Hide sensitive environment variable values from the logs', async () => {
    const env = { MY_TOKEN: 'secret token' };
    indexMock.mockRejectedValue(
      new Error(`Throw error: Exposing token ${env.MY_TOKEN}`)
    );
    const testArgs = [];

    const exitCode = await runCommand(testArgs, env);
    expect(stderrSpy).toBeCalledWith(
      expect.stringMatching(
        new RegExp(
          `Throw error: Exposing token ${escapeRegExp(SECRET_REPLACEMENT)}`
        )
      )
    );
    expect(exitCode).toBe(1);
  });
});

async function runCommand(args, env?) {
  process = {
    ...process,
    argv: [
      'node', // Not used but a value is required at this index in the array
      'cli.js', // Not used but a value is required at this index in the array
      ...args,
    ],
    env: {
      ...process.env,
      ...env,
    },
  };

  // Require the yargs CLI script
  return (await require('./cli'))();
}
