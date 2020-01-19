const SemanticReleaseError = require('../..');

module.exports = class InheritedError extends SemanticReleaseError {
  constructor(message, code) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'InheritedError';
    this.code = code;
    this.newProperty = 'newProperty';
  }
};
