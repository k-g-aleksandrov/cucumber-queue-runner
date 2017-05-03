import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './SessionProgressBar.css';

const propTypes = {
  session: PropTypes.any.isRequired
};

class SessionProgressBar extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { session } = this.props;

    return (
      <tr>
        <td colSpan='4' style={{ height: '15px', padding: 0 }}>
          <div className='progress-chart'>
            <div style={{ backgroundColor: '#92DD96', width: `${(session.passedCount * 100) / session.totalCount}%` }}/>
            <div style={{ backgroundColor: '#F2928C', width: `${(session.failedCount * 100) / session.totalCount}%` }}/>
            <div
              style={{ backgroundColor: 'lightgray', width: `${(session.skippedCount * 100) / session.totalCount}%` }}
            />
            <div
              style={{ backgroundColor: '#F5F28F', width: `${(session.progressCount * 100) / session.totalCount}%` }}
            />
            <div style={{ backgroundColor: '#8AF', width: `${(session.queueCount * 100) / session.totalCount}%` }}/>
          </div>
        </td>
      </tr>
    );
  }
}

SessionProgressBar.propTypes = propTypes;

export default connect()(SessionProgressBar);
