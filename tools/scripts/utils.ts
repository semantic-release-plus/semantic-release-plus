import { readWorkspaceJson } from '@nx/workspace';

export function getPublishableLibNames(workspaceJson = readWorkspaceJson()) {
  const { projects } = workspaceJson;

  return Object.keys(projects).filter(
    (key) =>
      projects[key].projectType === 'library' &&
      projects[key].targets?.build?.executor === '@nx/node:package'
  );
}
