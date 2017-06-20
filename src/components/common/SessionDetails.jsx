import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import Table from 'react-bootstrap/lib/Table';

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
        <tr key='finished'>
          <th>Finished</th>
          <td>
            {moment(new Date()).to(moment(sessionDetails.endDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </td>
        </tr>
      );
      timeAndDuration.push(
        <tr key='duration'>
          <th>Duration</th>
          <td>
            {moment(sessionDetails.endDate).to(moment(sessionDetails.startDate), true)}
          </td>
        </tr>
      );
    } else {
      timeAndDuration.push(
        <tr>
          <th>Started</th>
          <td>
            {moment(new Date()).to(moment(sessionDetails.startDate))}
            <br/>
            <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
              {moment(sessionDetails.startDate).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          </td>
        </tr>
      );
    }

    return (
      <Table>
        <thead>
          <tr>
            <td colSpan={2}><h2>Session Details</h2></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Project</th>
            <td>{sessionDetails.project}</td>
          </tr>
          {timeAndDuration}
          <tr>
            <th>Session ID</th>
            <td>{sessionDetails.sessionId}</td>
          </tr>
          <tr>
            <th>Scope</th>
            <td>
              {sessionDetails.scenariosFilter.scope === 'custom'
                ? `custom - ${sessionDetails.scenariosFilter.tags}`
                : sessionDetails.scenariosFilter.scope}
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

SessionDetails.propTypes = propTypes;

export default SessionDetails;
