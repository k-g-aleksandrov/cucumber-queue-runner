import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';

import TestCasesColumn from './TestCasesColumn';

import './ScenarioSimilarityPanel.css';

const propTypes = {
  scenario: PropTypes.any
};

class ScenarioPanel extends Component {

  constructor(props) {
    super(props);
  }

  getColor(value) {
    const hue = (value * 120).toString(10);

    return [ `hsl(${hue},100%,76%)` ].join('');
  }

  render() {
    const { scenario } = this.props;
    let row = null;
    let color;

    if (scenario.noTagsWarning) {
      color = 'lightgray';
    } else {
      color = this.getColor(scenario.similarity);
    }

    row = (
      <Row
        style={{
          padding: '8px',
          paddingLeft: '10px',
          borderTop: '1px solid #ccc',
          borderLeft: '1px solid #ccc',
          backgroundColor: color
        }}
      >
        <Col md={4} key='title'>
          {!scenario.scenarioNameDiff && <span>{scenario.scenarioName}</span>}
          {scenario.scenarioNameDiff && (
            <span>
              <span><b>Aut:&nbsp;</b></span><span dangerouslySetInnerHTML={{ __html: scenario.scenarioNameDiff }}/><br/>
              <span><b>TR:&nbsp;&nbsp;</b></span><span dangerouslySetInnerHTML={{ __html: scenario.testCaseTitleDiff }}/>
            </span>
          )}
          {
            scenario.filters.includes('disabled')
            && <span style={{ color: 'red', fontStyle: 'italic' }}><br/>[disabled]&nbsp;</span>
          }
        </Col>
        <TestCasesColumn scenario={scenario}/>
      </Row>
    );
    return row;
  }
}

ScenarioPanel.propTypes = propTypes;

export default ScenarioPanel;
