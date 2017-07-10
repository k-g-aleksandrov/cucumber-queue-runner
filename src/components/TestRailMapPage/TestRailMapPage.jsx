import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from 'components/common/Spinner';

import { Button } from 'react-bootstrap';
import { Grid } from 'react-bootstrap';
import { Link } from 'react-router';

import { fetchTestRailMap } from 'redux/actions/projectsActions';

import SuitePanel from './TestRailToFeatures/SuitePanel';
import ProjectPanel from './FeaturesToTestRail/ProjectPanel';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  testRailMap: PropTypes.any,
  params: PropTypes.object
};

class TestRailMapPage extends Component {

  constructor(props) {
    super(props);

    this.fetchTestRailMap = this.fetchTestRailMap.bind(this);
  }

  componentDidMount() {
    this.fetchTestRailMap();
  }

  fetchTestRailMap() {
    this.props.dispatch(fetchTestRailMap());
  }

  render() {
    const { testRailMap } = this.props;
    const queryParams = this.props.location.query;

    if (this.props.loading || !testRailMap) {
      return <Spinner/>;
    }

    const activeMode = queryParams.mode ? queryParams.mode : 'testrail';

    if (activeMode === 'features') {
      if (testRailMap && !testRailMap.reverseMap) {
        return (
          <Grid fluid>
            <Button>Scan</Button>
          </Grid>
        );
      }
      return (
        <Grid fluid style={{ paddingBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ display: 'inline' }}>
              Features → TestRail Cases&nbsp;
            </h2>
            (<Link to={'/testrail-map?mode=testrail'}>TestRail Cases → Features</Link>)
          </div>
          {Object.keys(testRailMap.reverseMap).map((project, i) => {
            return <ProjectPanel key={i} project={testRailMap.reverseMap[project]}/>;
          })}
        </Grid>
      );
    }
    if (testRailMap && !testRailMap.testRailMap) {
      return <Grid fluid>Loading TestRail Map</Grid>;
    }
    return (
      <Grid fluid style={{ paddingBottom: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ display: 'inline' }}>
            TestRail Cases → Features&nbsp;
          </h2>
          (<Link to={'/testrail-map?mode=features'}>Features → TestRail Cases</Link>)
        </div>
        {Object.keys(testRailMap.testRailMap).map((suite, i) => {
          return <SuitePanel key={i} suite={testRailMap.testRailMap[suite]}/>;
        })}
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { loading, testRailMap } = state.projects;

  return { loading, testRailMap };
}

TestRailMapPage.propTypes = propTypes;

export default connect(mapStateToProps)(TestRailMapPage);
