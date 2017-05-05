const initialState = {
  report: [],
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'session/scenario/report/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'session/scenario/report/SUCCESS':
      console.log(JSON.stringify(action.payload));
      return {
        loading: false,
        errors: null,
        report: action.payload.report
      };
    case 'session/scenario/report/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
