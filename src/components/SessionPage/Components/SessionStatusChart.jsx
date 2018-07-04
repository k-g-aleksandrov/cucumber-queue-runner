import React, { Component } from 'react';
import PropTypes from 'prop-types';

let Doughnut;

const propTypes = {
  sessionBriefStatus: PropTypes.any.isRequired
};

class SessionStatusChart extends Component {

  constructor(props) {
    super(props);
    Doughnut = require('react-chartjs-2').Doughnut;
  }

  componentDidMount() {
  }

  render() {
    const { sessionBriefStatus } = this.props;

    const chartData = {
      labels: [
        `Queue (${sessionBriefStatus.queueCount})`,
        `Progress (${sessionBriefStatus.progressCount})`,
        `Passed (${sessionBriefStatus.passedCount})`,
        `Failed (${sessionBriefStatus.failedCount})`,
        `Skipped (${sessionBriefStatus.skippedCount})`
      ],
      datasets: [
        {
          data: [
            sessionBriefStatus.queueCount,
            sessionBriefStatus.progressCount,
            sessionBriefStatus.passedCount,
            sessionBriefStatus.failedCount,
            sessionBriefStatus.skippedCount
          ],
          backgroundColor: [
            '#8AF',
            '#F5F28F',
            '#92DD96',
            '#F2928C',
            'lightgray'
          ],
          hoverBackgroundColor: [
            '#8AF',
            '#F5F28F',
            '#92DD96',
            '#F2928C',
            'lightgray'
          ]
        }
      ]
    };

    if (Doughnut === undefined) {
      return null;
    }
    return (
      <div className='info-panel'>
        <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
        <Doughnut data={chartData} height={100}/>
      </div>
    );
  }
}

SessionStatusChart.propTypes = propTypes;

export default SessionStatusChart;
