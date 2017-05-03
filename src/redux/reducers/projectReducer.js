const initialState = {
  projectDetails: [],
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'project/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'project/SUCCESS':
      console.log(JSON.stringify(action.payload));
      return {
        loading: false,
        errors: null,
        projectDetails: action.payload.project
      };
    case 'project/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
