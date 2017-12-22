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
    this.fetchEnvironment();
  }

  fetchEnvironment() {
    this.props.dispatch(fetchEnvironment());
  }

  render() {
    const { environment } = this.props;

    if (!environment) {
      return (
        <div>
          <h1>Environment</h1>
          <span>Loading...</span>
        </div>
      );
    }

    return (
      <div>
        <h1>Environment</h1>
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
