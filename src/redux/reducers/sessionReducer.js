const initialState = {
  availableSessions: [],
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'session/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'session/SUCCESS':
      console.log(JSON.stringify(action.payload));
      return {
        loading: false,
        errors: null,
        session: action.payload.session
      };
    case 'session/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
