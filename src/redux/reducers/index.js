import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';
import sessionReducer from './sessionReducer';
import projectsReducer from './projectsReducer';
import projectReducer from './projectReducer';
import scenariosReducer from './scenariosReducer';

export default combineReducers({
  sessions: sessionsReducer,
  session: sessionReducer,
  projects: projectsReducer,
  project: projectReducer,
  report: scenariosReducer
});
