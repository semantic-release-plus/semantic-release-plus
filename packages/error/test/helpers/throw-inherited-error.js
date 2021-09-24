const inheritedError =require( './inherited-error');

module.exports = () => {
  throw new inheritedError('message', 'code');
};
