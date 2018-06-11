import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchCoverage } from 'redux/actions/dashboardActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  coverage: PropTypes.any
};

class CoveragePage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchCoverage();
  }

  getCoverageData(coverage) {
    const total = coverage.blocked + coverage.failed + coverage.passed + coverage.retest + coverage.untested;
    let percent = ((total - coverage.untested) / total) * 100;

    percent = Math.round(percent * 10) / 10;
    return { percent, covered: total - coverage.untested, total };
  }

  fetchCoverage() {
    this.props.dispatch(fetchCoverage());
  }

  render() {
    const { coverage } = this.props;

    console.log(coverage);

    if (!coverage) {
      return (
        <div>
          <h1 style={{ marginTop: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Tests Coverage</h1>
          <span style={{ fontWeight: '700px', fontSize: '76px', color: 'white' }}>Loading...</span>
        </div>
      );
    }

    const coverageData = {};

    for (const projectKey of Object.keys(coverage)) {
      const project = coverage[projectKey];

      for (const projectEntry of project) {
        if (!coverageData[projectKey]) {
          coverageData[projectKey] = [];
        }
        coverageData[projectKey].push(this.getCoverageData(projectEntry));
      }
    }

    return (
      <div className='info-panel'>
        <h1>Tests Coverage</h1>
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
  const { coverage } = state.dashboard;

  return { coverage };
}

CoveragePage.propTypes = propTypes;

export default connect(mapStateToProps)(CoveragePage);
