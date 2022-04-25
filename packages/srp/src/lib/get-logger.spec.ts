import * as getLogger from './get-logger';

describe('get-logger', () => {
  test('Expose "error", "success" and "log" functions', () => {
    const stdout = jest.fn();
    const stderr = jest.fn();
    const logger = getLogger({
      stdout: { write: stdout },
      stderr: { write: stderr },
    });

    logger.log('test log');
    logger.success('test success');
    logger.error('test error');

    expect(stdout.mock.calls[0][0]).toMatch(/.*test log/);
    expect(stdout.mock.calls[1][0]).toMatch(/.*test success/);
    expect(stderr.mock.calls[0][0]).toMatch(/.*test error/);
  });
});
