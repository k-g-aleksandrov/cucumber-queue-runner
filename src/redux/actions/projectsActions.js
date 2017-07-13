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

export function countProjectFilters(projectId) {
  return {
    [CALL_API]: {
      endpoint: `/api/projects/${projectId}/counter`,
      method: 'GET',
      types: ['project/counter/REQUEST', 'project/counter/SUCCESS', 'project/counter/FAILURE']
    }
  };
}

export function fetchProjectScenarios(projectId, scope, offset) {
  return {
    [CALL_API]: {
      endpoint: `/api/projects/${projectId}/scenarios?filter=${scope}&offset=${offset}`,
      method: 'GET',
      types: [
        { type: 'project/scope/REQUEST', meta: { scope, offset } },
        { type: 'project/scope/SUCCESS', meta: { scope, offset } },
        { type: 'project/scope/FAILURE', meta: { scope, offset } }
      ]
    }
  };
}

export function scanProject(projectId) {
  return {
    [CALL_API]: {
      endpoint: `/api/projects/${projectId}/scan`,
      method: 'GET',
      types: ['project/scan/REQUEST', 'project/scan/SUCCESS', 'project/scan/FAILURE']
    }
  };
}

export function deleteProject(projectId) {
  return {
    [CALL_API]: {
      endpoint: `/api/projects/${projectId}`,
      method: 'DELETE',
      types: ['project/delete/REQUEST', 'project/delete/SUCCESS', 'project/delete/FAILURE']
    }
  };
}

export function fetchTestRailMap() {
  return {
    [CALL_API]: {
      endpoint: '/api/projects/testrail-map',
      method: 'GET',
      types: ['projects/testrail-map/REQUEST', 'projects/testrail-map/SUCCESS', 'projects/testrail-map/FAILURE']
    }
  };
}

export function rescanTestRailMap() {
  return {
    [CALL_API]: {
      endpoint: '/api/projects/testrail-map/scan',
      method: 'GET',
      types: ['projects/testrail-map/REQUEST', 'projects/testrail-map/SUCCESS', 'projects/testrail-map/FAILURE']
    }
  };
}
