import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

const propTypes = {
  scenarios: PropTypes.any
};

class InProgressScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios } = this.props;

    return (
      <div>
        {scenarios.map((scenario, i) => {
          return (
            <div key={i} style={{ backgroundColor: 'lightgray', marginLeft: '16px', padding: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
              <span>
                {scenario.scenarioName}&nbsp;
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
              </span>
              <div style={{ float: 'right' }}>
                {scenario.executor}
                &nbsp;({moment(new Date()).to(moment(scenario.startTimestamp))})
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

InProgressScenariosTable.propTypes = propTypes;

export default InProgressScenariosTable;
