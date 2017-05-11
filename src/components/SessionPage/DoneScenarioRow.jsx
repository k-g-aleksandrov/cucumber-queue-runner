import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Report from './Report';

const propTypes = {
  session: PropTypes.any,
  scenario: PropTypes.any,
  report: PropTypes.any
};

class DoneScenarioRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      reportDisplayed: false,
      report: null
    };
  }

  handleGetScenarioReportClick(sessionId, scenarioId) {
    this.setState({ reportDisplayed: !this.state.reportDisplayed });
    if (this.state.report === null) {
      fetch(`/api/sessions/${sessionId}/reports/${scenarioId}`)
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ report: responseJson.report });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  render() {
    const { session, scenario } = this.props;

    let backgroundColor = 'white';

    if (scenario.result === 'passed') {
      backgroundColor = 'lightgreen';
    } else if (scenario.result === 'failed') {
      backgroundColor = 'tomato';
    } else if (scenario.result === 'skipped') {
      backgroundColor = 'lightgray';
    }

    if (scenario.result === 'skipped') {
      return (
        <tr style={{ backgroundColor }}>
          <td>
            <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span><br/>
          </td>
        </tr>
      );
    }
    return (
      <tr onClick={() => {
        this.handleGetScenarioReportClick(session.details.sessionId, scenario.scenarioId);
      }}
        style={{ backgroundColor }}
      >
        <td>
          <span style={{ cursor: 'pointer' }}>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span><br/>
          {this.state.reportDisplayed && <Report report={this.state.report}/>}
        </td>
      </tr>
    );
  }
}

DoneScenarioRow.propTypes = propTypes;

export default connect()(DoneScenarioRow);
