import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';

import SessionsTable from './SessionsTable';

import { fetchSessions } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  availableSessions: PropTypes.array,
  params: PropTypes.object,
  children: PropTypes.node
};

class SessionsPage extends Component {

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
    if (availableSessions.length === 0) {
      return <Alert bsStyle='info'>No running sessions</Alert>;
    }
    if (this.props.params.session) {
      return (
        <div>{this.props.children}</div>
      );
    }
    return (
      <SessionsTable availableSessions={availableSessions}/>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableSessions } = state.sessions;

  return { loading, availableSessions };
}

SessionsPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsPage);
