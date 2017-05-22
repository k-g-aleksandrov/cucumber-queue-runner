import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Alert from 'react-bootstrap/lib/Alert';

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

    let sessionScenariosToRender = sessionScenarios;

    if (this.state.onlyFailed) {
      sessionScenariosToRender = {};
      for (const feature of Object.keys(sessionScenarios)) {
        const featureScenarios = sessionScenarios[feature].filter((scenario) => {
          return scenario.result === 'failed';
        });

        if (featureScenarios && featureScenarios.length) {
          sessionScenariosToRender[feature] = featureScenarios;
        }
      }
    }
    return (
      <Grid fluid>
        <Row style={{ paddingBottom: '4px' }}>
          <Col>
            <h2 style={{ display: 'inline' }}>
              {this.state.onlyFailed ? 'Failed Scenarios' : 'All Scenarios'}
            </h2>&nbsp;
            (<a onClick={this.handleOnlyFailedCheck}>{this.state.onlyFailed ? 'Show all' : 'Show failed'}</a>)
          </Col>
        </Row>
        <Row>
          <Col>
            {sessionScenariosToRender && Object.keys(sessionScenariosToRender).map((feature, i) => {
              return (
                <Grid style={{ border: 'solid 1px #ccc' }} fluid key={i}>
                  <Row style={{ margin: '2px' }}>
                    <Col><h4>{feature}</h4></Col>
                  </Row>
                  {sessionScenariosToRender[feature].map((scenario, j) => {
                    if (this.state.onlyFailed && scenario.result !== 'failed') {
                      return null;
                    }
                    return <SessionHistoryScenarioRow key={j} scenario={scenario}/>;
                  })}
                </Grid>
              );
            })}
          </Col>
        </Row>

        {!sessionScenariosToRender || !Object.keys(sessionScenariosToRender).length &&
        <Row>
          <Col>
            <Alert bsStyle='info'>No failed scenarios</Alert>
          </Col>
        </Row>
        }
      </Grid>
    );
  }
}

ScenariosHistoryTable.propTypes = propTypes;

export default ScenariosHistoryTable;
