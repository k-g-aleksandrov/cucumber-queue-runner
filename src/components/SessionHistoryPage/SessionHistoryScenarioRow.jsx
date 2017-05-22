import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Report from './Report';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

const propTypes = {
  scenario: PropTypes.any
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
      backgroundColor = 'lightgreen';
    } else if (scenario.result === 'failed') {
      backgroundColor = 'tomato';
    } else if (scenario.result === 'skipped') {
      backgroundColor = 'lightgray';
    }

    if (scenario.result === 'skipped') {
      return (
        <Row style={{ backgroundColor }}>
          <Col>
            <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span><br/>
          </Col>
        </Row>
      );
    }
    return (
      <Row onClick={() => {
        this.handleGetScenarioReportClick();
      }} style={{ backgroundColor, padding: '4px' }}
      >
        <Col>
          <Grid fluid>
            <Row>
              <Col md={10}>
                <span style={{ cursor: 'pointer' }}>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span><br/>
              </Col>
              <Col md={2} style={{ textAlign: 'center' }}>{scenario.executor}</Col>
            </Row>
            {this.state.reportDisplayed && <Report report={scenario.report}/>}
          </Grid>
        </Col>
      </Row>
    );
  }
}

SessionHistoryScenarioRow.propTypes = propTypes;

export default connect()(SessionHistoryScenarioRow);
