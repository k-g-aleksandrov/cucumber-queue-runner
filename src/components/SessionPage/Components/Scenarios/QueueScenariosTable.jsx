import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap-button-loader';

const propTypes = {
  sessionId: PropTypes.any,
  scenarios: PropTypes.any
};

class QueueScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios, sessionId } = this.props;

    return (
      <Table bordered style={{ marginBottom: '0px' }}>
        <tbody>
          {scenarios.map((scenario, i) => {
            return (
              <tr key={i}>
                <td>
                  <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
                  <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button onClick={() => this.handleSkipScenarioClick(sessionId, scenario.scenarioId)}>
                    Skip Scenario ->
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }
}

QueueScenariosTable.propTypes = propTypes;

export default QueueScenariosTable;
