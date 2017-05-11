import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';
import projectsReducer from './projectsReducer';
import projectReducer from './projectReducer';
import scenariosReducer from './scenariosReducer';

export default combineReducers({
  sessions: sessionsReducer,
  projects: projectsReducer,
  project: projectReducer,
  report: scenariosReducer
});
