const initialState = {
  availableSessions: {}
};

export default function (state = initialState, action) {
  let newState;

  switch (action.type) {
    case 'sessions/REQUEST':
      return Object.assign({}, state);
    case 'sessions/SUCCESS':
      newState = { ...action.payload };
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
            status: action.payload.session.status,
            error: action.payload.session.error
          }
        }
      };
    case 'session/FAILURE':
      return Object.assign({}, state);
    default:
      return state;
  }
}
