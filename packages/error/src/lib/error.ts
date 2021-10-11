export class SemanticReleaseError extends Error {
  code: string;
  details: string;
  semanticRelease = true;

  constructor(message?: string, code?: string, details?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'SemanticReleaseError';
    this.code = code;
    this.details = details;
    this.semanticRelease = true;
  }
}
