import { SemanticReleaseError as Error } from './error';
describe('error', () => {
  it('should work', () => {
    expect(new Error()).toBeDefined();
  });
});
