const initialState = {
  availableProjects: [],
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'projects/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'projects/SUCCESS':
      return {
        loading: false,
        errors: null,
        availableProjects: action.payload.projects
      };
    case 'projects/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
