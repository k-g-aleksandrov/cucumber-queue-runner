import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Table } from 'react-bootstrap';
import SessionsTableHeader from './SessionsTableHeader';
import SessionRow from './SessionRow';
import SessionProgressBar from './SessionProgressBar';

const propTypes = {
  availableSessions: PropTypes.array
};

class SessionsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      availableSessions: []
    };
  }

  render() {
    const { availableSessions } = this.props;
    const rows = [];

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
