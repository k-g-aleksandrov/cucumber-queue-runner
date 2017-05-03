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
