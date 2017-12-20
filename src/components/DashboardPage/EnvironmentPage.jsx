import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchEnvironment } from 'redux/actions/dashboardActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  environment: PropTypes.any
};

class EnvironmentPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchCoverage();
  }

  getEnvironmentData(coverage) {
    const total = coverage.blocked + coverage.failed + coverage.passed + coverage.retest + coverage.untested;
    let percent = ((total - coverage.untested) / total) * 100;

    percent = Math.round(percent * 10) / 10;
    return { percent, covered: total - coverage.untested, total };
  }

  fetchEnvironment() {
    this.props.dispatch(fetchEnvironment());
  }

  render() {
    const { environment } = this.props;

    console.log(environment);

    if (!environment) {
      return (
        <div>
          <h1>Environment</h1>
          <span>Loading...</span>
        </div>
      );
    }

    const coverageData = {};

    for (const projectKey of Object.keys(environment)) {
      const project = environment[projectKey];

      for (const projectEntry of project) {
        if (!coverageData[projectKey]) {
          coverageData[projectKey] = [];
        }
        coverageData[projectKey].push(this.getCoverageData(projectEntry));
      }
    }

    return (
      <div>
        <h1>Environment</h1>
        {Object.keys(coverageData).map((key, index) => {
          return (
            <span key={index}>
              {key}: {coverageData[key][0].percent}% ({coverageData[key][0].covered} of {coverageData[key][0].total})
            </span>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { environment } = state.dashboard;

  return { environment };
}

EnvironmentPage.propTypes = propTypes;

export default connect(mapStateToProps)(EnvironmentPage);
