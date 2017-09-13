import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
      <div style={{  padding: '32px', backgroundColor: 'white' }}>
        <div style={{ paddingBottom: '4px' }}>
          <h2 className='scenarios-report-header'>
            {this.state.onlyFailed ? 'Failed Scenarios' : 'All Scenarios'}
          </h2>
          &nbsp;
          <a onClick={this.handleOnlyFailedCheck}>[{this.state.onlyFailed ? 'Show all' : 'Show failed'}]</a>
        </div>
        <hr/>
        <div>
          {sessionScenariosToRender && Object.keys(sessionScenariosToRender).map((feature, i) => {
            return (
              <div key={i}>
                {!this.state.onlyFailed && <Row style={{ margin: '4px' }}>
                  <Col><h4><span>Feature:&nbsp;</span><span>{feature}</span></h4></Col>
                </Row>}
                {sessionScenariosToRender[feature].map((scenario, j) => {
                  if (this.state.onlyFailed && scenario.result !== 'failed') {
                    return null;
                  }
                  return <SessionHistoryScenarioRow key={j} scenario={scenario} failed={this.state.onlyFailed}/>;
                })}
                <hr style={{ marginLeft: '16px' }}/>
              </div>
            );
          })}
        </div>

        {!sessionScenariosToRender || !Object.keys(sessionScenariosToRender).length &&
          <Row>
            <Col>
              <Alert bsStyle='info'>No scenarios</Alert>
            </Col>
          </Row>
        }
      </div>
    );
  }
}

ScenariosHistoryTable.propTypes = propTypes;

export default ScenariosHistoryTable;
