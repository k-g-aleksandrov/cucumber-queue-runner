import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SessionsTable from './SessionsTable';
import SessionsHistoryTable from './SessionsHistoryTable';
import SessionLostPanel from './panels/SessionLostPanel';

const propTypes = {
  params: PropTypes.object,
  location: PropTypes.any,
  children: PropTypes.node
};

class SessionsPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.params.session) {
      return (
        <div>{this.props.children}</div>
      );
    }
    return (
      <div>
        <SessionLostPanel sessionId={this.props.location.query.lost}/>
        <h3 style={{ paddingBottom: '10px' }}>Current Sessions</h3>
        <SessionsTable/>
        <h3 style={{ paddingBottom: '10px' }}>Sessions History</h3>
        <SessionsHistoryTable/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableSessions } = state.sessions;

  return { loading, availableSessions };
}

SessionsPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsPage);
