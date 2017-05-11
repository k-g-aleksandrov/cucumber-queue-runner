import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SessionsTable from './SessionsTable';
import SessionsHistoryTable from './SessionsHistoryTable';


import Alert from 'react-bootstrap/lib/Alert';

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
        {this.props.location.query.lost &&
        <Alert bsStyle='danger'>
          <span style={{ fontWeight: 'bold' }}>Error: </span>
          Session
          <span style={{ fontWeight: 'bold' }}> {this.props.location.query.lost} </span>
          was finished or does not exist
        </Alert>}
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
