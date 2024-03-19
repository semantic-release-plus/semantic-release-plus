import * as childProcess from 'child_process';
import { uploadTerraformModule } from './upload-terraform-module';
import * as debugFactory from 'debug';
import { PublishContext, Logger } from '@semantic-release-plus/core';

// Mock the child_process module
jest.mock('child_process', () => ({
  execSync: jest.fn(),
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

const mockExecSync = jest.mocked(childProcess.execSync);

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
    mockExecSync.mockImplementation(() => 'Success');
    const expectedCurlCommand = `curl --fail-with-body --location --header "JOB-TOKEN: ${params.gitlabJobToken}" --upload-file ${params.tarPath} ${params.gitlabApiUrl}/projects/${params.gitlabProjectId}/packages/terraform/modules/${params.moduleName}/${params.moduleSystem}/${params.version}/file`;

    await uploadTerraformModule(params, mockContext as PublishContext);

    expect(mockExecSync).toHaveBeenCalledTimes(1);
    expect(mockExecSync).toHaveBeenCalledWith(expectedCurlCommand);
  });

  it('should log an error if the command fails', async () => {
    // Mock execSync to simulate a command failure
    const errorMessage = 'Command failed';
    mockExecSync.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await uploadTerraformModule(params, mockContext);

    expect(mockExecSync).toHaveBeenCalledTimes(1);
    expect(mockExecSync).toThrow();

    // Expect the error logger to have been called with the error message
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(errorMessage),
    );

    // You can add more assertions here to verify error handling, stderr/stdout logging, etc.
  });
});
