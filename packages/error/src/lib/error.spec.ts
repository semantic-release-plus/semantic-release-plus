import { SemanticReleaseError } from './error';

describe('error', () => {
  it('should work', () => {
    expect(new SemanticReleaseError()).toBeDefined();
  });
});
