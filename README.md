# @semantic-release/error

Error type used by all [semantic-release](https://github.com/semantic-release/semantic-release) packages.

[![Travis](https://img.shields.io/travis/semantic-release/error.svg)](https://travis-ci.org/semantic-release/error)
[![Codecov](https://img.shields.io/codecov/c/github/semantic-release/error.svg)](https://codecov.io/gh/semantic-release/error)
[![Greenkeeper badge](https://badges.greenkeeper.io/semantic-release/error.svg)](https://greenkeeper.io)

Errors of type `SemanticReleaseError` or an inherited type will be considered by [semantic-release](https://github.com/semantic-release/semantic-release) as an expected exception case (no release to be done, running on a PR etc..). That indicate to the `semantic-release` process to stop and exit with the `0` success code.

Any other type of error will be considered by [semantic-release](https://github.com/semantic-release/semantic-release) as an unexpected error (i/o issue, code problem etc...). That indicate to the `semantic-release` process to stop, log the error and exit with the `1` failure code.

## Usage

```js
const SemanticReleaseError = require('@semantic-release/error');

// Default
throw new SemanticReleaseError();

// With error message
throw new SemanticReleaseError('An error happened');

// With error message and error code
throw new SemanticReleaseError('An error happened', 'ECODE');

// With inheritance
class InheritedError extends SemanticReleaseError {
  constructor(message, code, newProperty) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.newProperty = 'newProperty';
  }
}

throw new InheritedError('An error happened', 'ECODE');
```
