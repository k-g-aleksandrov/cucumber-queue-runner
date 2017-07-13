import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from 'components/common/Spinner';

import { Grid, Row, Col } from 'react-bootstrap';

import { fetchTestRailMap, rescanTestRailMap } from 'redux/actions/projectsActions';

import SuitePanel from './TestRailToFeatures/SuitePanel';

import ProjectPanel from './FeaturesToTestRail/ProjectPanel';
import ScenarioSimilarityPanel from './SortScenariosBySimilarity/ScenarioSimilarityPanel';

import InitialScanDialog from './InitialScanDialog';
import RescanPanel from './Common/RescanPanel';
import NavigationPanel from './Common/NavigationPanel';

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

    return (
      <Grid fluid style={{ paddingBottom: '20px' }}>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={4}>
            <NavigationPanel activeMode={activeMode}/>
          </Col>
          <Col mdOffset={5} md={3}>
            <RescanPanel onRescan={this.handleRescanClick} testRailMapperDetails={testRailMapperDetails}/>
          </Col>
        </Row>
        {activeMode === 'features' && Object.keys(testRailMapperDetails.featuresToTestRailMap).map((project, i) => {
          return <ProjectPanel key={i} project={testRailMapperDetails.featuresToTestRailMap[project]}/>;
        })}
        {activeMode === 'similarity' && testRailMapperDetails.sortedBySimilarity.map((scenario, i) => {
          return <ScenarioSimilarityPanel key={i} scenario={scenario}/>;
        })}
        {activeMode === 'testrail' && Object.keys(testRailMapperDetails.testRailToFeaturesMap).map((suite, i) => {
          return (
            <SuitePanel
              key={i}
              testRailUrl={testRailMapperDetails.testRailUrl}
              suite={testRailMapperDetails.testRailToFeaturesMap[suite]}
            />
          );
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
