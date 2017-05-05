import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getScenarioReport } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  session: PropTypes.any,
  scenario: PropTypes.any
};

class DoneScenarioRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      report: null
    };

    this.handleGetScenarioReportClick = this.handleGetScenarioReportClick.bind(this);
  }

  handleGetScenarioReportClick(sessionId, scenarioId) {
    this.props.dispatch(getScenarioReport(sessionId, scenarioId));
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
      <tr onClick={this.handleGetScenarioReportClick(session.sessionId, scenario.scenarioId)}
        style={{ backgroundColor }}
      >
        <td>
          <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span>
        </td>
        <Report/>
      </tr>
    );
  }
}

function mapStateToProps(state) {
  const { loading, report } = state.report;

  return { loading, report };
}

DoneScenarioRow.propTypes = propTypes;

export default connect(mapStateToProps)(DoneScenarioRow);
