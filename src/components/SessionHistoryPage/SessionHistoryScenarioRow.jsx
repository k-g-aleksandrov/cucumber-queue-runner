import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Report from './Report';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

const propTypes = {
  scenario: PropTypes.any,
  failed: PropTypes.bool
};

class SessionHistoryScenarioRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      reportDisplayed: false
    };
  }

  handleGetScenarioReportClick() {
    this.setState({ reportDisplayed: !this.state.reportDisplayed });
  }

  render() {
    const { scenario } = this.props;

    let backgroundColor = 'white';

    if (scenario.result === 'passed') {
      backgroundColor = '#92DD96';
    } else if (scenario.result === 'failed') {
      backgroundColor = '#F2928C';
    } else if (scenario.result === 'skipped') {
      backgroundColor = 'lightgray';
    }

    if (scenario.result === 'skipped') {
      return (
        <Row style={{ backgroundColor }}>
          <Col style={{ padding: '8px' }}>
            <span>
              {`${scenario.scenarioName} (:${scenario.scenarioLine})`}
            </span><br/>
          </Col>
        </Row>
      );
    }
    return (
      <div>
        <div onClick={() => {
          this.handleGetScenarioReportClick();
        }} style={{ backgroundColor, marginLeft: '16px', padding: '8px', cursor: 'pointer' }}
        >
          <span>
            {this.props.failed && <b>{scenario.report[0].name}: </b>}
            {
              <span>
                Scenario: {scenario.scenarioName}&nbsp;
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
              </span>
            }
          </span>
          <span style={{ float: 'right' }}>{scenario.executor}</span>
        </div>
        <div style={{ marginLeft: '32px' }}>
          {this.state.reportDisplayed && <Report report={scenario.report}/>}
        </div>
      </div>
    );
  }
}

SessionHistoryScenarioRow.propTypes = propTypes;

export default connect()(SessionHistoryScenarioRow);
