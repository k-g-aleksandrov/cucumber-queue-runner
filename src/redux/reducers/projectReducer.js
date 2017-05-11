const initialState = {
  projectDetails: [],
  projectScanResult: null,
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case 'project/REQUEST':
    case 'project/scan/REQUEST':
    case 'project/delete/REQUEST':
      return Object.assign({}, state, { loading: true, errors: null });
    case 'project/SUCCESS':
    case 'project/delete/SUCCESS':
      return {
        loading: false,
        errors: null,
        projectDetails: action.payload.project
      };
    case 'project/scan/SUCCESS':
      return {
        loading: false,
        errors: null,
        projectScanResult: action.payload.project
      };
    case 'project/FAILURE':
    case 'project/scan/FAILURE':
    case 'project/delete/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    default:
      return state;
  }
}
