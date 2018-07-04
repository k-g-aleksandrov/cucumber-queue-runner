import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

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
        <Row className='details-row' key='finished'>
          <Col md={3} className='details-row-title'>Finished</Col>
          <Col md={9} className='details-row-value'>
            {moment(new Date()).to(moment(sessionDetails.endDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </Col>
        </Row>
      );
      timeAndDuration.push(
        <Row className='details-row' key='duration'>
          <Col md={3} className='details-row-title'>Duration</Col>
          <Col md={9} className='details-row-value'>
            {moment(sessionDetails.endDate).to(moment(sessionDetails.startDate), true)}
          </Col>
        </Row>
      );
    } else {
      timeAndDuration.push(
        <Row className='details-row' key='started'>
          <Col md={3} className='details-row-title'>Started</Col>
          <Col md={9} className='details-row-value'>
            {moment(new Date()).to(moment(sessionDetails.startDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </Col>
        </Row>
      );
    }

    return (
      <div className='info-panel'>
        <Row><Col md={12}><h3>Session Details</h3></Col></Row>
        <Row className='details-row'>
          <Col md={3} className='details-row-title'>Project</Col>
          <Col md={9} className='details-row-value'>{sessionDetails.project}</Col>
        </Row>
        {timeAndDuration}
        <Row className='details-row'>
          <Col md={3} className='details-row-title'>Session ID</Col>
          <Col md={9} className='details-row-value'>{sessionDetails.sessionId}</Col>
        </Row>
        <Row className='details-row'>
          <Col md={3} className='details-row-title'>Scope</Col>
          <Col md={9} className='details-row-value'>
            {sessionDetails.scenariosFilter.scope}
            {sessionDetails.scenariosFilter.scope === 'custom' && <br/>}
            {sessionDetails.scenariosFilter.scope === 'custom' &&
              <i>{sessionDetails.scenariosFilter.tags.join(', ')}</i>
            }
          </Col>
        </Row>
      </div>
    );
  }
}

SessionDetails.propTypes = propTypes;

export default SessionDetails;
