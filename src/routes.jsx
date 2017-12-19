import React from 'react';
import { IndexRedirect, Route, Redirect } from 'react-router';
import App from 'components/App';
import SessionsPage from 'components/SessionsPage';
import SessionPage from 'components/SessionPage/Runtime';
import SessionHistoryPage from 'components/SessionPage/History';
import SessionFeatureHistoryPage from 'components/SessionPage/History/AdvancedReport/SessionFeatureHistoryPage';
import ProjectsPage from 'components/ProjectsPage';
import ProjectPage from 'components/ProjectPage';
import TestRailMapPage from 'components/TestRailMapPage';
import DashboardPage from 'components/DashboardPage';

export default (
  <Route component={App} path='/'>
    <IndexRedirect to='sessions'/>
    <Route component={SessionsPage} path='sessions'>
      <Route component={SessionHistoryPage} path='history/:session'>
        <Route component={SessionFeatureHistoryPage} path='features/:feature'/>
      </Route>
      <Route component={SessionPage} path=':session'/>
    </Route>
    <Route component={ProjectsPage} path='projects'>
      <Route component={ProjectPage} path=':project'/>
    </Route>
    <Route component={TestRailMapPage} path='testrail-map'/>
    <Route component={DashboardPage} path='dashboard'/>
    <Redirect from='*' to=''/>
  </Route>
);
