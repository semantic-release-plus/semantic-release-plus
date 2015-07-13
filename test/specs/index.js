const { test } = require('tap')

const SemanticReleaseError = require('../../dist')

test('instanciates error', (t) => {
  const error = new SemanticReleaseError()

  t.ok(error instanceof Error)
  t.end()
})

test('sets message', (t) => {
  const message = 'foo'
  const error = new SemanticReleaseError(message)

  t.is(error.message, message)
  t.end()
})

test('sets message and code', (t) => {
  const code = 'ENOFOO'
  const message = 'bar'
  const error = new SemanticReleaseError(message, code)

  t.is(error.code, code)
  t.is(error.message, message)
  t.end()
})
