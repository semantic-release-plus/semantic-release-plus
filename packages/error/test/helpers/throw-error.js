import { SemanticReleaseError } from '../../src';

module.exports = () => {
  throw new SemanticReleaseError('message', 'code');
};
