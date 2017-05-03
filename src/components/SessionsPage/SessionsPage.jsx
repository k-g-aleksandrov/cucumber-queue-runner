import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SessionsTable from './SessionsTable';

const propTypes = {
  params: PropTypes.object,
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
      <SessionsTable/>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableSessions } = state.sessions;

  return { loading, availableSessions };
}

SessionsPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionsPage);
