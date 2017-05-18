import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Table, Alert } from 'react-bootstrap';
import SessionsHistoryTableHeader from './SessionsHistoryTableHeader';
import SessionsHistoryTableRow from './SessionsHistoryTableRow';

import { fetchSessionsHistory } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  sessionsHistory: PropTypes.any
};

class SessionsHistoryTable extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchSessionsHistory();
    this.timerID = setInterval(
      () => this.fetchSessionsHistory(),
      15000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  fetchSessionsHistory() {
    this.props.dispatch(fetchSessionsHistory());
  }

  render() {
    const { sessionsHistory } = this.props;

    if (!sessionsHistory) {
      return <div style={{ fontStyle: 'italic' }}>loading...</div>;
    }

    if (Object.keys(sessionsHistory).length === 0) {
      return <Alert bsStyle='info'>No sessions history</Alert>;
    }

    return (
      <Table style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }} striped bordered>
        <tbody>
          <SessionsHistoryTableHeader/>
          {sessionsHistory.map((session, i) => {
            return <SessionsHistoryTableRow key={i} session={session}/>;
          })}
        </tbody>
      </Table>
    );
  }
}

function mapStateToProps(state) {
  const { sessionsHistory } = state.sessions;

  return { sessionsHistory };
}

SessionsHistoryTable.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsHistoryTable);
