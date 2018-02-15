import test from 'ava';
import SemanticReleaseError from '..';
import throwError from './helpers/throw-error';
import InheritedError from './helpers/inherited-error';
import throwInheritedError from './helpers/throw-inherited-error';

test('Instanciates error', t => {
  const error = new SemanticReleaseError();

  t.true(error instanceof Error);
  t.true(error.semanticRelease);
  t.true(error instanceof SemanticReleaseError);
});

test('Sets message', t => {
  const message = 'foo';
  const error = new SemanticReleaseError(message);

  t.is(error.message, message);
  t.true(error.semanticRelease);
  t.true(error instanceof SemanticReleaseError);
});

test('Sets message and code', t => {
  const code = 'ENOFOO';
  const message = 'bar';
  const error = new SemanticReleaseError(message, code);

  t.is(error.code, code);
  t.is(error.message, message);
  t.true(error.semanticRelease);
  t.true(error instanceof SemanticReleaseError);
});

test('Sets message, code and details', t => {
  const code = 'ENOFOO';
  const message = 'bar';
  const details = 'baz';
  const error = new SemanticReleaseError(message, code, details);

  t.is(error.code, code);
  t.is(error.message, message);
  t.is(error.details, details);
  t.true(error.semanticRelease);
  t.true(error instanceof SemanticReleaseError);
});

test('Include the stacktrace and name', async t => {
  const error = await t.throws(() => throwError());
  t.regex(error.stack, /helpers\/throw-error/);
  t.is(error.name, 'SemanticReleaseError');
  t.true(error.semanticRelease);
  t.true(error instanceof SemanticReleaseError);
});

test('Include "semanticRelease" property in inherited errors', async t => {
  const error = await t.throws(() => throwInheritedError());
  t.regex(error.stack, /helpers\/throw-inherited-error/);
  t.is(error.name, 'InheritedError');
  t.true(error instanceof InheritedError);
  t.true(error.semanticRelease);
});
