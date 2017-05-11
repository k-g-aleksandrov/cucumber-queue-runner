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
    const { briefStatus } = this.props.session;

    return (
      <tr>
        <td colSpan='4' style={{ height: '15px', padding: 0 }}>
          <div className='progress-chart'>
            <div
              style={{
                backgroundColor: 'lightgreen',
                width: `${(briefStatus.passedCount * 100) / briefStatus.totalCount}%`
              }}
            />
            <div
              style={{
                backgroundColor: 'tomato',
                width: `${(briefStatus.failedCount * 100) / briefStatus.totalCount}%`
              }}
            />
            <div
              style={{
                backgroundColor: 'lightgray',
                width: `${(briefStatus.skippedCount * 100) / briefStatus.totalCount}%`
              }}
            />
            <div
              style={{
                backgroundColor: '#F5F28F',
                width: `${(briefStatus.progressCount * 100) / briefStatus.totalCount}%`
              }}
            />
            <div
              style={{
                backgroundColor: '#8AF',
                width: `${(briefStatus.queueCount * 100) / briefStatus.totalCount}%`
              }}
            />
          </div>
        </td>
      </tr>
    );
  }
}

SessionProgressBar.propTypes = propTypes;

export default connect()(SessionProgressBar);
