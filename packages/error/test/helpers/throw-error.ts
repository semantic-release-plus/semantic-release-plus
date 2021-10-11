import { SemanticReleaseError } from '../../src';

export const throwError = () => {
  throw new SemanticReleaseError('message', 'code');
};
