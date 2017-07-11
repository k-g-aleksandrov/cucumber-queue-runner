import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from 'components/common/Spinner';

import Button from 'react-bootstrap-button-loader';
import { Grid } from 'react-bootstrap';
import { Link } from 'react-router';

import { fetchTestRailMap, rescanTestRailMap } from 'redux/actions/projectsActions';

import SuitePanel from './TestRailToFeatures/SuitePanel';
import ProjectPanel from './FeaturesToTestRail/ProjectPanel';

import moment from 'moment';

import './NotScannedPanel.css';

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

    if (activeMode === 'features') {
      if (testRailMapperDetails && !testRailMapperDetails.featuresToTestRailMap) {
        return (
          <div id='initialScanDialog'>
            <h3>Project was never scanned</h3>
            <Button bsStyle='primary' onClick={() => this.handleRescanClick()}>Do First Scan</Button>
          </div>
        );
      }
      return (
        <Grid fluid style={{ paddingBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'inline' }}>
              Features → TestRail Cases&nbsp;
            </h3>
            (<Link to={'/testrail-map?mode=testrail'}>TestRail Cases → Features</Link>)
            <div style={{ float: 'right' }}>
              <Button bsStyle='primary' onClick={() => this.handleRescanClick()}>Rescan</Button>
            </div>
            <span
              style={{
                float: 'right',
                fontStyle: 'italic',
                fontSize: '12px',
                paddingRight: '10px',
                color: '#777'
              }}
            >
              Last scan: {moment(new Date()).to(moment(testRailMapperDetails.mappingDate))}<br/>
              Current state: {testRailMapperDetails.state}
            </span>
          </div>
          {Object.keys(testRailMapperDetails.featuresToTestRailMap).map((project, i) => {
            return <ProjectPanel key={i} project={testRailMapperDetails.featuresToTestRailMap[project]}/>;
          })}
        </Grid>
      );
    }
    if (testRailMapperDetails && !testRailMapperDetails.testRailToFeaturesMap) {
      return (
        <div id='initialScanDialog'>
          <h3>Project was never scanned</h3>
          <Button bsStyle='primary' onClick={() => this.handleRescanClick()}>Do First Scan</Button>
        </div>
      );
    }
    return (
      <Grid fluid style={{ paddingBottom: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ display: 'inline' }}>
            TestRail Cases → Features&nbsp;
          </h3>
          (<Link to={'/testrail-map?mode=features'}>Features → TestRail Cases</Link>)
          <div style={{ float: 'right' }}>
            <Button bsStyle='primary' onClick={() => this.handleRescanClick()}>Rescan</Button>
          </div>
          <span
            style={{
              float: 'right',
              fontStyle: 'italic',
              fontSize: '12px',
              paddingRight: '10px',
              color: '#777'
            }}
          >
            Last scan: {moment(new Date()).to(moment(testRailMapperDetails.mappingDate))}<br/>
            Current state: {testRailMapperDetails.state}
          </span>
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
