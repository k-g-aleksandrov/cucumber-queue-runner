import React, { Component } from 'react';

class SessionsHistoryTableHeader extends Component {

  render() {
    return (
      <tr>
        <th>Session</th>
        <th>Finished On</th>
        <th>Duration</th>
        <th style={{ textAlign: 'center', backgroundColor: 'lightgreen' }}>Passed</th>
        <th style={{ textAlign: 'center', backgroundColor: 'tomato' }}>Failed</th>
        <th style={{ textAlign: 'center', backgroundColor: 'lightgray' }}>Skipped</th>
        <th style={{ textAlign: 'center' }}>Pass Rate</th>
      </tr>
    );
  }
}

export default SessionsHistoryTableHeader;
