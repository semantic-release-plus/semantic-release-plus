import SemanticReleaseError from '../../index';

export default class InheritedError extends SemanticReleaseError {
  constructor(message, code, newProperty) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.newProperty = 'newProperty';
  }
}
