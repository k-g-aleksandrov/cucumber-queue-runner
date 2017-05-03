import { CALL_API } from 'redux-api-middleware';

export function fetchProjects() {
  return {
    [CALL_API]: {
      endpoint: '/api/projects',
      method: 'GET',
      types: ['projects/REQUEST', 'projects/SUCCESS', 'projects/FAILURE']
    }
  };
}

export function fetchProjectFilters(projectId) {
  return {
    [CALL_API]: {
      endpoint: `/api/projects/${projectId}`,
      method: 'GET',
      types: ['project/REQUEST', 'project/SUCCESS', 'project/FAILURE']
    }
  };
}
