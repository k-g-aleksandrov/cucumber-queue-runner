import React, { Component } from 'react';

class SessionsTableHeader extends Component {

  render() {
    return (
      <tr>
        <th>Session ID</th>
        <th>Start Date</th>
        <th>Project</th>
        <th style={{ verticalAlign: 'center' }}>In Queue</th>
        <th style={{ verticalAlign: 'center' }}>In Progress</th>
        <th style={{ verticalAlign: 'center' }}>Done</th>
        <th>Pass Rate</th>
        <th>&nbsp;</th>
      </tr>
    );
  }
}

export default SessionsTableHeader;
