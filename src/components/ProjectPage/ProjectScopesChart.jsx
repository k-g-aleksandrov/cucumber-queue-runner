import React, { Component } from 'react';
import PropTypes from 'prop-types';

let Doughnut;

const propTypes = {
  projectDetails: PropTypes.any.isRequired
};

class ProjectScopesChart extends Component {

  constructor(props) {
    super(props);
    Doughnut = require('react-chartjs-2').Doughnut;
  }

  componentDidMount() {
  }

  render() {
    const { projectDetails } = this.props;

    const labels = [];
    const data = [];
    const backgroundColors = [];

    for (const filterId of Object.keys(projectDetails.count)) {
      if (filterId !== 'full') {
        labels.push(`${projectDetails.scopes[filterId].filter.displayName} (${projectDetails.count[filterId]})`);
        data.push(projectDetails.count[filterId]);
        backgroundColors.push(projectDetails.scopes[filterId].filter.chartColor);
      }
    }
    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors
        }
      ]
    };

    if (Doughnut === undefined) {
      return null;
    }
    return <Doughnut data={chartData} height={70}/>;
  }
}

ProjectScopesChart.propTypes = propTypes;

export default ProjectScopesChart;
