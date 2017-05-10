import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { Link } from 'react-router';

const propTypes = {
  session: PropTypes.any.isRequired
};

class SessionsHistoryTableRow extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { details, briefStatus } = this.props.session;

    if (!details || !briefStatus) {
      return null;
    }

    return (
      <tr>
        <td style={{ verticalAlign: 'center' }}>
          {details.project}&nbsp;
          <span style={{ fontStyle: 'italic', fontColor: '#d3d3d3' }}>
            (scope:&nbsp;
            {details.scenariosFilter.scope === 'custom'
              ? `custom - ${details.scenariosFilter.tags}`
              : details.scenariosFilter.scope})
          </span><br/>
          <Link to={`/sessions/history/${details.sessionId}`}>
            {details.sessionId}
          </Link>
        </td>
        <td style={{ verticalAlign: 'center' }}>
          {moment(new Date()).to(moment(details.endDate))}
          <br/>
          <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
            {moment(details.endDate).format('DD.MM.YYYY HH:mm:ss')}
          </span>
        </td>
        <td style={{ verticalAlign: 'center' }}>
          {moment(details.endDate).to(moment(details.startDate), false)}
        </td>
        <td style={{ verticalAlign: 'center', textAlign: 'center' }}>
          {briefStatus.passedCount}
        </td>
        <td style={{ verticalAlign: 'center', textAlign: 'center' }}>
          {briefStatus.failedCount}
        </td>
        <td style={{ verticalAlign: 'center', textAlign: 'center' }}>
          {briefStatus.skippedCount}
        </td>
        <td style={{ verticalAlign: 'center', textAlign: 'center' }}>
          <span>
            {briefStatus.doneCount > 0 ? `${((briefStatus.passedCount / briefStatus.doneCount) * 100).toFixed(2)}%` : '-'}
          </span>
        </td>
      </tr>
    );
  }
}

SessionsHistoryTableRow.propTypes = propTypes;

export default SessionsHistoryTableRow;
