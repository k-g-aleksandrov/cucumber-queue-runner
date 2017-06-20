const initialState = {
  availableSessions: {}
};

export default function (state = initialState, action) {
  let newState;

  switch (action.type) {
    case 'sessions/REQUEST':
      return Object.assign({}, state);
    case 'sessions/SUCCESS':
      newState = {
        ...action.payload,
        sessionsHistory: state.sessionsHistory
      };
      Object.keys(newState.availableSessions).map((session) => {
        newState.availableSessions[session] = {
          status: {
            queue: [],
            inProgress: [],
            done: {},
            passed: [],
            failed: [],
            skipped: []
          },
          ...state.availableSessions[session],
          ...action.payload.availableSessions[session]
        };
      });
      return newState;
    case 'sessions/FAILURE':
      return Object.assign({}, state);
    case 'sessions/history/SUCCESS':
      newState = { ...state };
      newState.sessionsHistory = action.payload.sessionsHistory;
      return newState;
    case 'session/REQUEST':
      return Object.assign({}, state);
    case 'session/SUCCESS':
      return {
        ...state,
        availableSessions: {
          ...state.availableSessions,
          [action.meta.sessionId]: {
            ...state.availableSessions[action.meta.sessionId],
            details: action.payload.session.details,
            briefStatus: action.payload.session.briefStatus,
            status: action.payload.session.status,
            error: action.payload.session.error
          }
        }
      };
    case 'session/FAILURE':
      return Object.assign({}, state);
    case 'session/history/REQUEST':
      return Object.assign({}, state);
    case 'session/history/SUCCESS':
      return {
        ...state,
        sessionsHistory: {
          ...state.sessionsHistory,
          [action.meta.sessionId]: action.payload[action.meta.sessionId]
        }
      };
    case 'session/history/FAILURE':
      return Object.assign({}, state);
    default:
      return state;
  }
}
