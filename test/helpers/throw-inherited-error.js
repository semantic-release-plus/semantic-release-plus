import InheritedError from './inherited-error';

export default () => {
  throw new InheritedError('message', 'code');
};
