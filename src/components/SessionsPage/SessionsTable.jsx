import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Table, Alert } from 'react-bootstrap';
import SessionsTableHeader from './SessionsTableHeader';
import SessionRow from './SessionRow';
import SessionProgressBar from './SessionProgressBar';

import { fetchSessions } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  availableSessions: PropTypes.any
};

class SessionsTable extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchSessions();
    this.timerID = setInterval(
      () => this.fetchSessions(),
      3000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  fetchSessions() {
    this.props.dispatch(fetchSessions());
  }

  render() {
    const { availableSessions } = this.props;

    if (!availableSessions) {
      return <div style={{ fontStyle: 'italic' }}>loading...</div>;
    }
    const rows = [];

    if (Object.keys(availableSessions).length === 0) {
      return <Alert bsStyle='info'>No running sessions</Alert>;
    }
    for (const key of Object.keys(availableSessions)) {
      if (availableSessions[key].details && availableSessions[key].briefStatus) {
        rows.push(
          <SessionRow key={`${availableSessions[key].details.sessionId}-row`}
            session={availableSessions[key]}
          />);
        rows.push(
          <SessionProgressBar key={`${availableSessions[key].details.sessionId}-progress`}
            session={availableSessions[key]}
          />
        );
      }
    }

    return (
      <div>
        <h3 style={{ paddingBottom: '10px' }}>Current Sessions</h3>
        <Table style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }} striped bordered>
          <tbody>
            <SessionsTableHeader/>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { availableSessions } = state.sessions;

  return { availableSessions };
}

SessionsTable.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsTable);
