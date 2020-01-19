const SemanticReleaseError = require('../..');

module.exports = () => {
  throw new SemanticReleaseError('message', 'code');
};
