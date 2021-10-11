import { InheritedError } from './inherited-error';

export const throwInheritedError = () => {
  throw new InheritedError('message', 'code');
};
