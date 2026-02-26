import * as childProcess from 'child_process';
import { uploadTerraformModule } from './upload-terraform-module';
import * as debugFactory from 'debug';
import { PublishContext, Logger } from '@semantic-release-plus/core';
// Mock the child_process module
jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));
// Mock the Debug function
jest.mock('debug', () => jest.fn(() => jest.fn()));
// Setup common input parameters for the uploadTerraformModule function
const params = {
  tarPath: 'path/to/tar',
  gitlabApiUrl: 'https://gitlab.example.com/api/v4',
  gitlabProjectId: '123',
  moduleName: 'test-module',
  moduleSystem: 'system',
  version: '1.0.0',
  gitlabJobToken: 'job-token',
};
const mockExecFileSync = jest.mocked(childProcess.execFileSync);
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  success: jest.fn(),
} as Logger;
const mockContext = {
  logger: mockLogger,
} as PublishContext;
describe('uploadTerraformModule', () => {
  beforeEach(() => {
    // Clear mock implementations and instances before each test
    jest.clearAllMocks();
  });
  it('should execute the curl command successfully', async () => {
    mockExecFileSync.mockImplementation(() => 'Success');
    const expectedUrl = `${params.gitlabApiUrl}/projects/${params.gitlabProjectId}/packages/terraform/modules/${params.moduleName}/${params.moduleSystem}/${params.version}/file`;
    await uploadTerraformModule(params, mockContext as PublishContext);
    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
    expect(mockExecFileSync).toHaveBeenCalledWith('curl', [
      '--fail-with-body',
      '--location',
      '--header',
      `JOB-TOKEN: ${params.gitlabJobToken}`,
      '--upload-file',
      params.tarPath,
      expectedUrl,
    ]);
  });
  it('should log an error and throw a SemanticReleaseError if the command fails', async () => {
    const errorMessage = 'Command failed';
    mockExecFileSync.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const rejection = expect(
      uploadTerraformModule(params, mockContext),
    ).rejects;
    await rejection.toThrow('Failed to upload terraform module');
    await rejection.toHaveProperty('semanticRelease', true);
    await rejection.toHaveProperty('code', 'EUPLOADFAIL');
    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(errorMessage),
    );
  });
});
