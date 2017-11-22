module.exports = class SemanticReleaseError extends Error {
  constructor(message, code) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'SemanticReleaseError';
    this.code = code;
    this.semanticRelease = true;
  }
};
