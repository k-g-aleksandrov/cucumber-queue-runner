import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Table from 'react-bootstrap/lib/Table';
import Alert from 'react-bootstrap/lib/Alert';

import SessionHistoryScenarioRow from './SessionHistoryScenarioRow';

const propTypes = {
  sessionScenarios: PropTypes.any,
  onlyFailed: PropTypes.bool
};

class ScenariosHistoryTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionScenarios, onlyFailed } = this.props;

    return (
      <Table style={{ marginBottom: '0px' }}>
        <thead>
          <tr>
            <td colSpan={2}><h2>Session Scenarios</h2></td>
          </tr>
        </thead>
        {sessionScenarios && Object.keys(sessionScenarios).map((feature, i) => {
          return (
            <tbody key={i}>
              <tr>
                <th>{feature}</th>
              </tr>
              {sessionScenarios[feature].map((scenario, j) => {
                if (onlyFailed && scenario.result !== 'failed') {
                  return null;
                }
                return <SessionHistoryScenarioRow key={j} scenario={scenario}/>;
              })}
            </tbody>
          );
        })}

        {!sessionScenarios &&
        <tbody>
          <tr>
            <Alert bsStyle='info'>No failed scenarios</Alert>
          </tr>
        </tbody>
        }
      </Table>
    );
  }
}

ScenariosHistoryTable.propTypes = propTypes;

export default ScenariosHistoryTable;
