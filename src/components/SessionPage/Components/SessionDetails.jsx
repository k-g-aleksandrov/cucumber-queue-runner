import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

const propTypes = {
  sessionDetails: PropTypes.any.isRequired,
  history: PropTypes.bool
};

class SessionDetails extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionDetails } = this.props;

    const timeAndDuration = [];

    if (this.props.history) {
      timeAndDuration.push(
        <div className='details-row' key='finished'>
          <span className='details-row-title'>Finished</span>
          <div className='details-row-value'>
            {moment(new Date()).to(moment(sessionDetails.endDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </div>
        </div>
      );
      timeAndDuration.push(
        <div className='details-row' key='duration'>
          <span className='details-row-title'>Duration</span>
          <div className='details-row-value'>
            {moment(sessionDetails.endDate).to(moment(sessionDetails.startDate), true)}
          </div>
        </div>
      );
    } else {
      timeAndDuration.push(
        <div className='details-row' key='started'>
          <span className='details-row-title'>Started</span>
          <div className='details-row-value'>
            {moment(new Date()).to(moment(sessionDetails.startDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className='info-panel' style={{ height: '250px' }}>
        <h2>Session Details</h2>
        <div className='details-row'>
          <span className='details-row-title'>Project</span>
          <span className='details-row-value'>{sessionDetails.project}</span>
        </div>
        {timeAndDuration}
        <div className='details-row'>
          <span className='details-row-title'>Session ID</span>
          <span className='details-row-value'>{sessionDetails.sessionId}</span>
        </div>
        <div className='details-row'>
          <span className='details-row-title'>Scope</span>
          <div className='details-row-value'>
            {sessionDetails.scenariosFilter.scope === 'custom'
              ? `custom - ${sessionDetails.scenariosFilter.tags.join(', ')}`
              : sessionDetails.scenariosFilter.scope}
          </div>
        </div>
      </div>
    );
  }
}

SessionDetails.propTypes = propTypes;

export default SessionDetails;
