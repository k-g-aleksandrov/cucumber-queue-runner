const initialState = {
  coverage: [],
  error: null
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'dashboard/coverage/REQUEST':
      return {
        ...state,
        error: null
      };
    case 'dashboard/coverage/SUCCESS':
      return {
        ...state,
        coverage: action.payload.coverage
      };
    case 'dashboard/coverage/FAILURE':
      return {
        ...state,
        error: action.payload.error
      };
    default:
      return state;
  }
}
