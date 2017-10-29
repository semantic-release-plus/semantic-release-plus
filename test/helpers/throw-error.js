import SemanticReleaseError from '../../index';

export default () => {
  throw new SemanticReleaseError('message', 'code');
};
