import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from 'components/common/Spinner';

import { Grid } from 'react-bootstrap';
import { Link } from 'react-router';

import { fetchTestRailMap, rescanTestRailMap } from 'redux/actions/projectsActions';

import SuitePanel from './TestRailToFeatures/SuitePanel';

import ProjectPanel from './FeaturesToTestRail/ProjectPanel';
import ScenarioSimilarityPanel from './SortScenariosBySimilarity/ScenarioSimilarityPanel';

import InitialScanDialog from './InitialScanDialog';
import RescanPanel from './Common/RescanPanel';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  testRailMapperDetails: PropTypes.any,
  params: PropTypes.object
};

class TestRailMapPage extends Component {

  constructor(props) {
    super(props);

    this.fetchTestRailMap = this.fetchTestRailMap.bind(this);
    this.handleRescanClick = this.handleRescanClick.bind(this);
  }

  componentDidMount() {
    this.fetchTestRailMap();
  }

  handleRescanClick() {
    if (!this.testRailMapperDetails || this.testRailMapperDetails.state === 'idle') {
      this.props.dispatch(rescanTestRailMap());
    } else {
      this.props.dispatch(fetchTestRailMap());
    }
  }

  fetchTestRailMap() {
    this.props.dispatch(fetchTestRailMap());
  }

  render() {
    const { testRailMapperDetails } = this.props;
    const queryParams = this.props.location.query;

    if (this.props.loading || !testRailMapperDetails) {
      return <Spinner/>;
    }

    const activeMode = queryParams.mode ? queryParams.mode : 'testrail';

    if (testRailMapperDetails
      && (!testRailMapperDetails.featuresToTestRailMap
        || !testRailMapperDetails.testRailToFeaturesMap
        || !testRailMapperDetails.sortedBySimilarity)) {
      return <InitialScanDialog onScanStarted={this.handleRescanClick}/>;
    }

    if (activeMode === 'features') {
      return (
        <Grid fluid style={{ paddingBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'inline' }}>
              Features → TestRail Cases&nbsp;
            </h3>
            (<Link to={'/testrail-map?mode=testrail'}>TestRail Cases → Features</Link>)
            <RescanPanel onRescan={this.handleRescanClick} testRailMapperDetails={testRailMapperDetails}/>
          </div>
          {Object.keys(testRailMapperDetails.featuresToTestRailMap).map((project, i) => {
            return <ProjectPanel key={i} project={testRailMapperDetails.featuresToTestRailMap[project]}/>;
          })}
        </Grid>
      );
    } else if (activeMode === 'similarity') {
      return (
        <Grid fluid style={{ paddingBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'inline' }}>
              Features → TestRail Cases&nbsp;
            </h3>
            (<Link to={'/testrail-map?mode=testrail'}>TestRail Cases → Features</Link>)
            <RescanPanel onRescan={this.handleRescanClick} testRailMapperDetails={testRailMapperDetails}/>
          </div>
          {testRailMapperDetails.sortedBySimilarity.map((scenario, i) => {
            return <ScenarioSimilarityPanel key={i} scenario={scenario}/>;
          })}
        </Grid>
      );
    }
    return (
      <Grid fluid style={{ paddingBottom: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ display: 'inline' }}>
            TestRail Cases → Features&nbsp;
          </h3>
          (<Link to={'/testrail-map?mode=features'}>Features → TestRail Cases</Link>)
          <RescanPanel onRescan={this.handleRescanClick} testRailMapperDetails={testRailMapperDetails}/>
        </div>

        {Object.keys(testRailMapperDetails.testRailToFeaturesMap).map((suite, i) => {
          return <SuitePanel key={i} suite={testRailMapperDetails.testRailToFeaturesMap[suite]}/>;
        })}
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { loading, testRailMapperDetails } = state.projects;

  return { loading, testRailMapperDetails };
}

TestRailMapPage.propTypes = propTypes;

export default connect(mapStateToProps)(TestRailMapPage);
