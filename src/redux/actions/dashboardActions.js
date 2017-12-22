import { CALL_API } from 'redux-api-middleware';

export function fetchCoverage() {
  return {
    [CALL_API]: {
      endpoint: '/api/dashboard/coverage',
      method: 'GET',
      types: ['dashboard/coverage/REQUEST', 'dashboard/coverage/SUCCESS', 'dashboard/coverage/FAILURE']
    }
  };
}

export function fetchEnvironment() {
  return {
    [CALL_API]: {
      endpoint: '/api/dashboard/environment',
      method: 'GET',
      types: ['dashboard/environment/REQUEST', 'dashboard/environment/SUCCESS', 'dashboard/environment/FAILURE']
    }
  };
}
