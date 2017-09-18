import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';
import projectsReducer from './projectsReducer';
import projectReducer from './projectReducer';
import dashboardReducer from './dashboardReducer';

export default combineReducers({
  sessions: sessionsReducer,
  projects: projectsReducer,
  project: projectReducer,
  dashboard: dashboardReducer
});
