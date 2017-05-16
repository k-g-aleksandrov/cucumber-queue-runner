import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/lib/Alert';

SessionLostPanel.propTypes = {
  sessionId: PropTypes.string
};

class SessionLostPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionId } = this.props;

    if (!sessionId) {
      return null;
    }

    return (
      <Alert bsStyle='danger'>
        <span style={{ fontWeight: 'bold' }}>Error: </span>
        Session
        <span style={{ fontWeight: 'bold' }}> {sessionId} </span>
        was finished or does not exist
      </Alert>
    );
  }
}

export default SessionLostPanel;
