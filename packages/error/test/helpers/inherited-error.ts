import { SemanticReleaseError } from '../../src';

export class InheritedError extends SemanticReleaseError {
  newProperty: string;
  constructor(message: string, code: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'InheritedError';
    this.code = code;
    this.newProperty = 'newProperty';
  }
}
