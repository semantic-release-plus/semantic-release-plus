import { InheritedError } from './inherited-error';

module.exports = () => {
  throw new InheritedError('message', 'code');
};
