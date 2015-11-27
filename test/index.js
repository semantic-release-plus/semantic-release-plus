var test = require('tap').test

var SemanticReleaseError = require('../')

test('instanciates error', function (t) {
  var error = new SemanticReleaseError()

  t.ok(error instanceof Error)
  t.end()
})

test('sets message', function (t) {
  var message = 'foo'
  var error = new SemanticReleaseError(message)

  t.is(error.message, message)
  t.end()
})

test('sets message and code', function (t) {
  var code = 'ENOFOO'
  var message = 'bar'
  var error = new SemanticReleaseError(message, code)

  t.is(error.code, code)
  t.is(error.message, message)
  t.end()
})
