import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  sessionId: PropTypes.any,
  onSkip: PropTypes.func.Required,
  scenarios: PropTypes.any
};

class QueueScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios, sessionId } = this.props;

    return (
      <div>
        {scenarios.map((scenario, i) => {
          return (
            <div key={i} style={{ marginLeft: '16px', padding: '8px' }}>
              <span style={{ width: '90%' }}>
                <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
                {scenario.scenarioName}&nbsp;
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
              </span>
              <div style={{ float: 'right' }}>
                <a onClick={() => this.props.onSkip(sessionId, scenario.scenarioId)}>
                  Skip >
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

QueueScenariosTable.propTypes = propTypes;

export default QueueScenariosTable;