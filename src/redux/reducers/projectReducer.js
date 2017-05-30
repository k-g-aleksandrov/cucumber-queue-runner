const initialState = {
  projectDetails: [],
  projectScanResult: null,
  errors: null,
  loading: false
};

export default function (state = initialState, action) {
  let result;

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
    case 'project/filters/FAILURE':
      return Object.assign({}, state, { loading: false, errors: action.errors });
    case 'project/filters/SUCCESS':
      result = Object.assign({}, state, { loading: false, errors: null });
      result.projectDetails.scopes[action.payload.filter].scenarios = action.payload.scenarios;
      result.projectDetails.scopes[action.payload.filter].loaded = true;
      return result;
    case 'project/filters/REQUEST':
    default:
      return state;
  }
}
