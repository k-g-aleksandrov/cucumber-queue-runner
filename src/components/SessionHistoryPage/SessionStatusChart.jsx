import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Doughnut } from 'react-chartjs-2';

const propTypes = {
  sessionBriefStatus: PropTypes.any.isRequired
};

class SessionStatusChart extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { sessionBriefStatus } = this.props;

    const chartData = {
      labels: [
        `Passed (${sessionBriefStatus.passedCount})`,
        `Failed (${sessionBriefStatus.failedCount})`,
        `Skipped (${sessionBriefStatus.skippedCount})`
      ],
      datasets: [
        {
          data: [
            sessionBriefStatus.passedCount,
            sessionBriefStatus.failedCount,
            sessionBriefStatus.skippedCount
          ],
          backgroundColor: [
            'lightgreen',
            'tomato',
            'lightgray'
          ],
          hoverBackgroundColor: [
            'lightgreen',
            'tomato',
            'lightgray'
          ]
        }
      ]
    };

    return <Doughnut data={chartData} height={70}/>;
  }
}

SessionStatusChart.propTypes = propTypes;

export default SessionStatusChart;
