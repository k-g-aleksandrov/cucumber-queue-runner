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

    if (Doughnut === undefined) {
      return null;
    }
    return <Doughnut data={chartData} height={70}/>;
  }
}

SessionStatusChart.propTypes = propTypes;

export default SessionStatusChart;
