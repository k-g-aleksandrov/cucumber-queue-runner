const initialState = {
  availableSessions: [],
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'sessions/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'sessions/SUCCESS':
      console.log(JSON.stringify(action.payload));
      return {
        loading: false,
        errors: null,
        availableSessions: action.payload.availableSessions
      };
    case 'sessions/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
