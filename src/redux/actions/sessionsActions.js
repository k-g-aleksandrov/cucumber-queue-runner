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
      types: [
        { type: 'session/REQUEST', meta: { sessionId } },
        { type: 'session/SUCCESS', meta: { sessionId } },
        { type: 'session/FAILURE', meta: { sessionId } }
      ]
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

export function fetchSessionsHistory() {
  return {
    [CALL_API]: {
      endpoint: '/api/sessions/history',
      method: 'GET',
      types: ['sessions/history/REQUEST', 'sessions/history/SUCCESS', 'sessions/history/FAILURE']
    }
  };
}

export function fetchSessionHistory(sessionId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/history/${sessionId}`,
      method: 'GET',
      types: [
        { type: 'session/history/REQUEST', meta: { sessionId } },
        { type: 'session/history/SUCCESS', meta: { sessionId } },
        { type: 'session/history/FAILURE', meta: { sessionId } }
      ]
    }
  };
}

export function fetchSessionFeatureHistory(sessionId, featureId) {
  return {
    [CALL_API]: {
      endpoint: `/api/sessions/history/${sessionId}/features/${featureId}`,
      method: 'GET',
      types: [
        { type: 'session/history/features/REQUEST', meta: { sessionId, featureId } },
        { type: 'session/history/features/SUCCESS', meta: { sessionId, featureId  } },
        { type: 'session/history/features/FAILURE', meta: { sessionId, featureId  } }
      ]
    }
  };
}
