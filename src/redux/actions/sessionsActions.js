import { CALL_API } from 'redux-api-middleware';

export function fetchSessions() {
  return {
    [CALL_API]: {
      endpoint: '/api/sessions',
      method: 'GET',
      types: ['sessions/REQUEST', 'sessions/SUCCESS', 'sessions/FAILURE']
    }
  };
}

export function fetchSessionDetails(sessionId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}`,
      method: 'GET',
      types: ['session/REQUEST', 'session/SUCCESS', 'session/FAILURE']
    }
  };
}

export function finishSession(sessionId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}/finish`,
      method: 'POST',
      types: ['session/finish/REQUEST', 'session/finish/SUCCESS', 'session/finish/FAILURE']
    }
  };
}

export function deleteSession(sessionId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}`,
      method: 'DELETE',
      types: ['session/delete/REQUEST', 'session/delete/SUCCESS', 'session/delete/FAILURE']
    }
  };
}

export function skipScenario(sessionId, scenarioId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}/skip/${scenarioId}`,
      method: 'POST',
      types: ['session/skip/scenario/REQUEST', 'session/skip/scenario/SUCCESS', 'session/skip/scenario/FAILURE']
    }
  };
}

export function getScenarioReport(sessionId, scenarioId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/${sessionId}/reports/${scenarioId}`,
      method: 'GET',
      types: ['session/scenario/report/REQUEST', 'session/scenario/report/SUCCESS', 'session/scenario/report/FAILURE']
    }
  };
}
