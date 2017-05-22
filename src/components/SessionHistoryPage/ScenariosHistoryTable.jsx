import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Table from 'react-bootstrap/lib/Table';
import Alert from 'react-bootstrap/lib/Alert';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import SessionHistoryScenarioRow from './SessionHistoryScenarioRow';

const propTypes = {
  sessionScenarios: PropTypes.any
};

class ScenariosHistoryTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      onlyFailed: false
    };

    this.handleOnlyFailedCheck = this.handleOnlyFailedCheck.bind(this);
  }

  handleOnlyFailedCheck() {
    this.setState({ onlyFailed: !this.state.onlyFailed });
  }

  render() {
    const { sessionScenarios } = this.props;

    return (
      <Table style={{ marginBottom: '0px' }}>
        <thead>
          <tr>
            <td colSpan={2}>
              <h2 style={{ display: 'inline' }}>
                {this.state.onlyFailed ? 'Failed Scenarios History' : 'Scenarios History'}
              </h2>&nbsp;
              (<a onClick={this.handleOnlyFailedCheck}>{this.state.onlyFailed ? 'Show all' : 'Only failed'}</a>)
            </td>
          </tr>
        </thead>
        {sessionScenarios && Object.keys(sessionScenarios).map((feature, i) => {
          return (
            <tbody key={i}>
              <tr>
                <th>{feature}</th>
              </tr>
              {sessionScenarios[feature].map((scenario, j) => {
                if (this.state.onlyFailed && scenario.result !== 'failed') {
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
