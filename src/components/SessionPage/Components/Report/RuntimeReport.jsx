import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Report from 'components/SessionPage/Components/Report/Report';

const propTypes = {
  sessionId: PropTypes.any.required,
  scenarioId: PropTypes.any.required,
  failed: PropTypes.bool,
  history: PropTypes.bool
};

class RuntimeReport extends Component {

  constructor(props) {
    super(props);

    console.log(props);
    this.state = {
      report: null
    };

    this.handleUpdateRuntimeReport = this.handleUpdateRuntimeReport.bind(this);
  }

  componentDidMount() {
    this.handleUpdateRuntimeReport(this.props.sessionId, this.props.scenarioId);
  }

  componentWillUnmount() {
    clearInterval(this.scenarioUpdateInterval);
  }

  handleUpdateRuntimeReport(sessionId, scenarioId) {
    this.updateRuntimeReport(sessionId, scenarioId);
    this.scenarioUpdateInterval = setInterval(
      () => this.updateRuntimeReport(sessionId, scenarioId),
      3000
    );
  }

  updateRuntimeReport(sessionId, scenarioId) {
    fetch(`/api/sessions/${sessionId}/runtime/${scenarioId}`)
      .then((response) => {
        return response.json();
      })
      .then((responseJson) => {
        this.setState({ report: responseJson.report });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { sessionId } = this.props;

    const report = this.state.report;

    if (!report) {
      return null;
    }
    return (
      <div style={{ marginLeft: '32px' }}>
        <Report report={report} sessionId={sessionId}/>
      </div>
    );
  }
}

RuntimeReport.propTypes = propTypes;

export default RuntimeReport;
