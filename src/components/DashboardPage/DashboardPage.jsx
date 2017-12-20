import React, { Component } from 'react';

import CoveragePage from './CoveragePage';
import EnvironmentPage from './EnvironmentPage';

import './DashboardPage.css';

const propTypes = {
};

class DashboardPage extends Component {

  constructor(props) {
    super(props);
  }
// interval={5000} infiniteLoop autoPlay
  render() {
    return (
      <div>
        <CoveragePage />
        <EnvironmentPage />
      </div>
    );
  }
}

DashboardPage.propTypes = propTypes;

export default DashboardPage;
