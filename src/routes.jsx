import React from 'react';
import { IndexRedirect, Route, Redirect } from 'react-router';
import App from 'components/App';
import SessionsPage from 'components/SessionsPage';
import SessionPage from 'components/SessionPage';
import SessionHistoryPage from 'components/SessionHistoryPage';
import ProjectsPage from 'components/ProjectsPage';
import ProjectPage from 'components/ProjectPage';

export default (
  <Route component={App} path='/'>
    <IndexRedirect to='sessions'/>
    <Route component={SessionsPage} path='sessions'>
      <Route component={SessionHistoryPage} path='history/:session'/>
      <Route component={SessionPage} path=':session'/>
    </Route>
    <Route component={ProjectsPage} path='projects'>
      <Route component={ProjectPage} path=':project'/>
    </Route>
    <Redirect from='*' to=''/>
  </Route>
);
