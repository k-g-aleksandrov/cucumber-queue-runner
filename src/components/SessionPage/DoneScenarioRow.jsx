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
      report: null
    };
  }

  handleGetScenarioReportClick(sessionId, scenarioId) {
    fetch(`/api/sessions/${sessionId}/reports/${scenarioId}`)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ report: responseJson.report });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { session, scenario } = this.props;

    let backgroundColor = 'white';

    if (scenario.result === 'passed') {
      backgroundColor = '#92DD96';
    } else if (scenario.result === 'failed') {
      backgroundColor = '#F2928C';
    } else if (scenario.result === 'skipped') {
      backgroundColor = 'lightgray';
    }

    return (
      <tr onClick={() => {
        this.handleGetScenarioReportClick(session.sessionId, scenario.scenarioId);
      }}
        style={{ backgroundColor }}
      >
        <td>
          <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span><br/>
          {scenario.result !== 'skipped' && <Report report={this.state.report}/>}
        </td>
      </tr>
    );
  }
}

DoneScenarioRow.propTypes = propTypes;

export default connect()(DoneScenarioRow);
