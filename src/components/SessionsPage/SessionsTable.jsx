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
  loading: PropTypes.bool.isRequired,
  availableSessions: PropTypes.array
};

class SessionsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      availableSessions: []
    };
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
      return <div>Loading...</div>;
    }
    const rows = [];

    if (availableSessions.length === 0) {
      return <Alert bsStyle='info'>No running sessions</Alert>;
    }
    for (let i = 0; i < availableSessions.length; i++) {
      rows.push(<SessionRow key={`${availableSessions[i].sessionId}-row`} session={availableSessions[i]}/>);
      rows.push(
        <SessionProgressBar key={`${availableSessions[i].sessionId}-progress`}
          session={availableSessions[i]}
        />
      );
    }

    return (
      <Table style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }} striped bordered>
        <tbody>
          <SessionsTableHeader/>
          {rows}
        </tbody>
      </Table>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableSessions } = state.sessions;

  return { loading, availableSessions };
}

SessionsTable.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsTable);
