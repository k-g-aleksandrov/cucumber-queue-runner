import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Row, Col } from 'react-bootstrap';

const propTypes = {
  index: PropTypes.any,
  scenario: PropTypes.any.isRequired
};

class ScenarioRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }

  render() {
    const { scenario } = this.props;

    return (
      <Row className='show-grid'>
        <Col md={1} style={{ textAlign: 'left', verticalAlign: 'center', width: '4%' }}>
          {this.props.index + 1}
        </Col>
        <Col md={8}>
          <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
          {scenario.scenarioName} (:{scenario.scenarioLine})<br/>
          {scenario.exampleParams && <span style={{ fontStyle: 'italic' }}>Examples: {scenario.exampleParams}</span>}
        </Col>
        <Col md={3} style={{ textAlign: 'right', verticalAlign: 'center' }}>
          {scenario.executions
            ? scenario.executions.slice(Math.max(scenario.executions.length - 30, 0)).map((execution, eI) => {
              return (
                <span
                  key={eI}
                  style={execution.result === 'passed' ? { color: 'green' } : { color: 'red' }}
                >
                &#x25cf;
              </span>
              );
            })
            : null}
        </Col>
      </Row>
    );
  }
}

ScenarioRow.propTypes = propTypes;

export default connect()(ScenarioRow);
