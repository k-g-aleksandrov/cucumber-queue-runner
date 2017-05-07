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
    const { details, briefStatus } = this.props.session;

    if (!details || !briefStatus) {
      return null;
    }
    return (
      <tr style={{ backgroundColor: this.state.isFinishing ? 'lightgray' : 'white' }}>
        <td style={{ verticalAlign: 'center' }} rowSpan='2'>
          {details.project}&nbsp;
          <span style={{ fontStyle: 'italic', fontColor: '#d3d3d3' }}>
            (scope: {details.scope === 'custom' ? `custom - ${details.tags}` : details.scope})
          </span><br/>
          <Link to={`/sessions/${details.sessionId}`}>
            {details.sessionId}
          </Link>
        </td>
        <td style={{ verticalAlign: 'center' }} rowSpan='2'>
          {moment(new Date()).to(moment(details.startDate))}
          <br/>
          <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
            {moment(details.startDate).format('DD.MM.YYYY HH:mm:ss')}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${details.sessionId}?tab=queue`}>{briefStatus.queueCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${details.sessionId}?tab=progress`}>{briefStatus.progressCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Link to={`/sessions/${details.sessionId}?tab=done`}>{briefStatus.doneCount}</Link>
        </td>
        <td style={{ textAlign: 'center' }}>
          <span>
            {briefStatus.doneCount > 0 ? `${((briefStatus.passedCount / briefStatus.doneCount) * 100).toFixed(2)}%` : '-'}
          </span>
          <span>&nbsp;(<font color='green'>{briefStatus.passedCount}</font>
                  :<font color='red'>{briefStatus.failedCount}</font>
                  :<font color='gray'>{briefStatus.skippedCount}</font>)</span>
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
