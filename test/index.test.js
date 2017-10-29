import test from 'ava';
import SemanticReleaseError from '../index';
import throwError from './helpers/throw-error';

test('Instanciates error', t => {
  const error = new SemanticReleaseError();

  t.true(error instanceof Error);
});

test('Sets message', t => {
  const message = 'foo';
  const error = new SemanticReleaseError(message);

  t.is(error.message, message);
});

test('Sets message and code', t => {
  const code = 'ENOFOO';
  const message = 'bar';
  const error = new SemanticReleaseError(message, code);

  t.is(error.code, code);
  t.is(error.message, message);
});

test('Include the stacktrace and name', async t => {
  const error = await t.throws(() => throwError());
  t.regex(error.stack, /helpers\/throw-error/);
  t.is(error.name, 'SemanticReleaseError');
});
