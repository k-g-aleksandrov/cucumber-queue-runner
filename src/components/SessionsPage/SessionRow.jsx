import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import moment from 'moment';

import { Link } from 'react-router';

import Button from 'react-bootstrap-button-loader';

import { finishSession, deleteSession } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  session: PropTypes.any.isRequired
};

class SessionRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isFinishing: false
    };

    this.handleFinishSessionClick = this.handleFinishSessionClick.bind(this);
    this.handleDeleteSessionClick = this.handleDeleteSessionClick.bind(this);
  }

  handleFinishSessionClick() {
    this.setState({ isFinishing: true });
    this.props.dispatch(finishSession(this.props.session.sessionId));
  }

  handleDeleteSessionClick() {
    this.setState({ isFinishing: true });
    this.props.dispatch(deleteSession(this.props.session.sessionId));
  }

  render() {
    const { session } = this.props;

    return (
      <tr style={{ backgroundColor: this.state.isFinishing ? 'lightgray' : 'white' }}>
        <td style={{ verticalAlign: 'center' }} rowSpan='2'>
          <Link to={`/sessions/${session.sessionId}`}>{session.sessionId}</Link>
        </td>
        <td style={{ verticalAlign: 'center' }} rowSpan='2'>
          {moment(session.startDate).format('DD.MM.YYYY HH:mm:ss')}
        </td>
        <td style={{ verticalAlign: 'center' }} rowSpan='2'>{session.project}&nbsp;
          <span style={{ fontStyle: 'italic', fontColor: '#d3d3d3' }}>(scope: {session.scope})</span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${session.sessionId}/#queue`}>{session.queueCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${session.sessionId}/#progress`}>{session.progressCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${session.sessionId}/#done`}>{session.doneCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <span>
            {session.doneCount > 0 ? `${((session.passedCount / session.doneCount) * 100).toFixed(2)}%` : '-'}
          </span>
          <span>&nbsp;(<font color='green'>{session.passedCount}</font>
                  :<font color='red'>{session.failedCount}</font>
                  :<font color='gray'>{session.skippedCount}</font>)</span>
        </td>
        <td style={{ textAlign: 'center', verticalAlign: 'center' }} rowSpan='2'>
          <Button bsStyle='primary' onClick={this.handleFinishSessionClick}>Finish</Button>
          <span>&nbsp;</span>
          <Button bsStyle='danger' onClick={this.handleDeleteSessionClick}>Remove</Button>
        </td>
      </tr>
    );
  }
}

SessionRow.propTypes = propTypes;

export default connect()(SessionRow);
