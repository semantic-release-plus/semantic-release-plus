const SemanticReleaseError =require('../../src');

module.exports = () => {
  throw new SemanticReleaseError('message', 'code');
};
