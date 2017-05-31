import React, { Component } from 'react';
import PropTypes from 'prop-types';

let Doughnut;

const propTypes = {
  scopes: PropTypes.any.isRequired
};

class ProjectScopesChart extends Component {

  constructor(props) {
    super(props);
    Doughnut = require('react-chartjs-2').Doughnut;
  }

  componentDidMount() {
  }

  render() {
    const { scopes } = this.props;

    const labels = [];
    const data = [];
    const backgroundColors = [];

    for (const filterId of Object.keys(scopes)) {
      if (filterId !== 'full') {
        labels.push(`${scopes[filterId].filter.displayName} (${scopes[filterId].scenarios.length})`);
        data.push(scopes[filterId].scenarios.length);
        backgroundColors.push(scopes[filterId].filter.chartColor);
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
