import test from 'ava';
import SemanticReleaseError from '../index';

test('Instanciates error', t => {
  const error = new SemanticReleaseError();

  t.true(error instanceof Error);
});

test('Sets message', t => {
  const message = 'foo';
  const error = new SemanticReleaseError(message);

  t.is(error.message, message);
});

test('Sets message and code', function(t) {
  const code = 'ENOFOO';
  const message = 'bar';
  const error = new SemanticReleaseError(message, code);

  t.is(error.code, code);
  t.is(error.message, message);
});
