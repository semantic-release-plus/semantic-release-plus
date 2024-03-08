import { gitlabTerraformModule } from './gitlab-terraform-module';

describe('gitlabTerraformModule', () => {
  it('should work', () => {
    expect(gitlabTerraformModule()).toEqual('gitlab-terraform-module');
  });
});
