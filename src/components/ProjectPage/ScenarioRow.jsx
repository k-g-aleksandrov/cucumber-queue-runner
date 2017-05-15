import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './ScenarioRow.css';

const propTypes = {
  index: PropTypes.any,
  scenario: PropTypes.any.isRequired
};

class ScenarioRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }

  render() {
    const { scenario } = this.props;

    return (
      <tr className='project-scenario-row'>
        <td style={{ textAlign: 'center', verticalAlign: 'center' }}>
          {this.props.index + 1}
        </td>
        <td>
          <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
          {scenario.scenarioName} (:{scenario.scenarioLine})
        </td>
        <td style={{ textAlign: 'right', verticalAlign: 'center' }}>
          {scenario.executions
            ? scenario.executions.slice(Math.max(scenario.executions.length - 30, 0)).map((execution, eI) => {
              return (
                <span
                  key={eI}
                  style={execution.result === 'passed' ? { color: 'green' } : { color: 'red' }}
                >
                &#x25cf;
              </span>
              );
            })
            : null}
        </td>
      </tr>
    );
  }
}

ScenarioRow.propTypes = propTypes;

export default connect()(ScenarioRow);
