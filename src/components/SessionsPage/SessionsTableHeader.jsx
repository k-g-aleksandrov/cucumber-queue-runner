import React, { Component } from 'react';

class SessionsTableHeader extends Component {

  render() {
    return (
      <tr>
        <th>Session</th>
        <th>Started</th>
        <th style={{ textAlign: 'center' }}>Queue</th>
        <th style={{ textAlign: 'center' }}>In Progress</th>
        <th style={{ textAlign: 'center' }}>Done</th>
        <th style={{ textAlign: 'center' }}>Pass Rate</th>
        <th>&nbsp;</th>
      </tr>
    );
  }
}

export default SessionsTableHeader;
