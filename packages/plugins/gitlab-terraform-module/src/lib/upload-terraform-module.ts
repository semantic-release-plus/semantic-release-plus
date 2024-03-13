import { execSync } from 'child_process';

export async function uploadTerraformModule({
  tarPath,
  gitlabApiUrl,
  gitlabProjectId,
  moduleName,
  moduleSystem,
  version,
  gitlabJobToken,
}: {
  tarPath: string;
  gitlabApiUrl: string;
  gitlabProjectId: string;
  moduleName: string;
  moduleSystem: string;
  version: string;
  gitlabJobToken: string;
}) {
  // 'curl --fail-with-body --location --header "JOB-TOKEN: ${CI_JOB_TOKEN}"
  //        --upload-file /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz
  //        ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/terraform/modules/${TERRAFORM_MODULE_NAME}/${TERRAFORM_MODULE_SYSTEM}/${TERRAFORM_MODULE_VERSION}/file'

  const curlCmd = `curl --fail-with-body --location --header "JOB-TOKEN: ${gitlabJobToken}" --upload-file ${tarPath} ${gitlabApiUrl}/projects/${gitlabProjectId}/packages/terraform/modules/${moduleName}/${moduleSystem}/${version}/file`;
  console.log(curlCmd);
  try {
    const result = execSync(curlCmd).toString();
    console.log(result);
  } catch (error: any) {
    console.error('Command failed with error:', error.message);
    // Optional: use error.stdout or error.stderr if needed
    if (error.stdout) {
      console.log('Standard Output:', error.stdout.toString());
    }
    if (error.stderr) {
      console.log('Standard Error:', error.stderr.toString());
    }
  }
}
