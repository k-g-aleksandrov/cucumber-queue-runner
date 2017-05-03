import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';
import sessionReducer from './sessionReducer';
import projectsReducer from './projectsReducer';
import projectReducer from './projectReducer';

export default combineReducers({
  sessions: sessionsReducer,
  session: sessionReducer,
  projects: projectsReducer,
  project: projectReducer
});
