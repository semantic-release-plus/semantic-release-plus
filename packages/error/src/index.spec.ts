import { SemanticReleaseError } from '.';
import {
  throwError,
  throwInheritedError,
  InheritedError,
} from '../test/helpers';

describe('error', () => {
  test('Instanciates error', () => {
    const error = new SemanticReleaseError();

    expect(error instanceof Error).toBe(true);
    expect(error.semanticRelease).toBe(true);
    expect(error instanceof SemanticReleaseError).toBe(true);
  });

  test('Sets message', () => {
    const message = 'foo';
    const error = new SemanticReleaseError(message);

    expect(error.message).toBe(message);
    expect(error.semanticRelease).toBe(true);
    expect(error instanceof SemanticReleaseError).toBe(true);
  });

  test('Sets message and code', () => {
    const code = 'ENOFOO';
    const message = 'bar';
    const error = new SemanticReleaseError(message, code);

    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.semanticRelease).toBe(true);
    expect(error instanceof SemanticReleaseError).toBe(true);
  });

  test('Sets message, code and details', () => {
    const code = 'ENOFOO';
    const message = 'bar';
    const details = 'baz';
    const error = new SemanticReleaseError(message, code, details);

    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.details).toBe(details);
    expect(error.semanticRelease).toBe(true);
    expect(error instanceof SemanticReleaseError).toBe(true);
  });

  test('Include the stacktrace and name', async () => {
    expect.assertions(4);
    try {
      throwError();
    } catch (error) {
      expect(error.stack).toMatch(/helpers\/throw-error/);
      expect(error.name).toBe('SemanticReleaseError');
      expect(error.semanticRelease).toBe(true);
      expect(error instanceof SemanticReleaseError).toBe(true);
    }
  });

  test('Include "semanticRelease" property in inherited errors', async () => {
    expect.assertions(4);
    try {
      throwInheritedError();
    } catch (error) {
      expect(error.stack).toMatch(/helpers\/throw-inherited-error/);
      expect(error.name).toBe('InheritedError');
      expect(error instanceof InheritedError).toBe(true);
      expect(error.semanticRelease).toBe(true);
    }
  });
});
