module.exports = SemanticReleaseError;

SemanticReleaseError.prototype = new Error();

function SemanticReleaseError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.code = code;
}
