import { CALL_API } from 'redux-api-middleware';

export function getScenarioReport(sessionId, scenarioId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}/reports/${scenarioId}`,
      method: 'GET',
      types: ['session/scenario/report/REQUEST', 'session/scenario/report/SUCCESS', 'session/scenario/report/FAILURE']
    }
  };
}
