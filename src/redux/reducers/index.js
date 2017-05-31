import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';
import projectsReducer from './projectsReducer';
import projectReducer from './projectReducer';

export default combineReducers({
  sessions: sessionsReducer,
  projects: projectsReducer,
  project: projectReducer
});
