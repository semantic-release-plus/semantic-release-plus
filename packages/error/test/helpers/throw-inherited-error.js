const InheritedError = require('./inherited-error');

module.exports = () => {
  throw new InheritedError('message', 'code');
};
