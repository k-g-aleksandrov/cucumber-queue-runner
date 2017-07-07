import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from 'components/common/Spinner';

import { Grid } from 'react-bootstrap';

import { fetchTestRailMap } from 'redux/actions/projectsActions';

import SuitePanel from './SuitePanel';

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

    if (this.props.loading || !testRailMap) {
      return <Spinner/>;
    }

    return (
      <Grid fluid style={{ paddingBottom: '20px' }}>
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
