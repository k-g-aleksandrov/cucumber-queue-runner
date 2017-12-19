import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DoneScenariosTable from 'components/SessionPage/Components/Scenarios/DoneScenariosTable';
import FailedScenariosTable from 'components/SessionPage/Components/Scenarios/FailedScenariosTable';

const propTypes = {
  sessionScenarios: PropTypes.any,
  sessionId: PropTypes.any
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

  filterFailedScenarios(scenarios) {
    const filteredScenarios = {};

    for (const feature of Object.keys(scenarios)) {
      const featureScenarios = scenarios[feature].filter((scenario) => {
        return scenario.result === 'failed';
      });

      if (featureScenarios && featureScenarios.length) {
        filteredScenarios[feature] = featureScenarios;
      }
    }
    return filteredScenarios;
  }

  render() {
    const { sessionScenarios, sessionId } = this.props;

    return (
      <div className='info-panel'>
        <div style={{ paddingBottom: '4px' }}>
          <h2 className='scenarios-report-header'>
            {this.state.onlyFailed ? 'Failed Scenarios' : 'All Scenarios'}
          </h2>
          &nbsp;
          <a onClick={this.handleOnlyFailedCheck}>[{this.state.onlyFailed ? 'Show all' : 'Show failed'}]</a>
        </div>
        <hr/>
        {this.state.onlyFailed
          && (
            <FailedScenariosTable sessionId={sessionId}
              sessionScenarios={this.filterFailedScenarios(sessionScenarios)} history
            />
          )
        }
        {!this.state.onlyFailed
          && (
            <DoneScenariosTable sessionId={sessionId}
              sessionScenarios={sessionScenarios} history
            />
          )
        }
      </div>
    );
  }
}

ScenariosHistoryTable.propTypes = propTypes;

export default ScenariosHistoryTable;
