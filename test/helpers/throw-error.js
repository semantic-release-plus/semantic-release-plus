import SemanticReleaseError from '../..';

export default () => {
  throw new SemanticReleaseError('message', 'code');
};
