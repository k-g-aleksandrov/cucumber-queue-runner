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
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
                {scenario.scenarioName}&nbsp;
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
                <a
                  style={{ cursor: 'pointer', float: 'right' }}
                  onClick={() => this.props.onSkip(sessionId, scenario.scenarioId)}
                >
                  Skip >
                </a>
              </div>
              <hr style={{ margin: '0px', borderTop: '1px solid #eeeeee' }}/>
            </div>
          );
        })}
      </div>
    );
  }
}

QueueScenariosTable.propTypes = propTypes;

export default QueueScenariosTable;
