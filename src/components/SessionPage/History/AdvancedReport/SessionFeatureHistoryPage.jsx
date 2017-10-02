import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const propTypes = {
  features: PropTypes.any,
  sessionId: PropTypes.any,
  params: PropTypes.any
};

class SessionFeatureHistoryPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='info-panel'>
        {JSON.stringify(this.props.params.feature)}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { sessionsHistory } = state.sessions;

  return { sessionsHistory };
}

SessionFeatureHistoryPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionFeatureHistoryPage);
