import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InProgressScenarioRow from './InProgressScenarioRow';

const propTypes = {
  scenarios: PropTypes.any,
  sessionId: PropTypes.any
};

class InProgressScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios, sessionId } = this.props;

    return (
      <div>
        {scenarios.map((scenario, i) => {
          return (
            <InProgressScenarioRow
              key={i}
              sessionId={sessionId}
              scenario={scenario}
            />
          );
        })}
      </div>
    );
  }
}

InProgressScenariosTable.propTypes = propTypes;

export default InProgressScenariosTable;
