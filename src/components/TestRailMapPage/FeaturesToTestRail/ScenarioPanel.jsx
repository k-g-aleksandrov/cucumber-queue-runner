import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';

import TestCasesColumn from './TestCasesColumn';

import stringSimilarity from 'string-similarity';

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

    if (scenario.testCases && scenario.testCases.length > 0) {
      let similarity = 1;
      let color = this.getColor(similarity);

      for (const testCase of scenario.testCases) {
        const newSimilarity = stringSimilarity.compareTwoStrings(scenario.scenarioName, testCase.title);

        similarity = newSimilarity < similarity ? newSimilarity : similarity;
        color = this.getColor(similarity);
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
            {
              scenario.filters.includes('disabled')
              && <span style={{ color: 'red', fontWeight: 'bold' }}>[disabled]&nbsp;</span>
            }
            {scenario.scenarioName}
          </Col>
          <TestCasesColumn testCases={scenario.testCases}/>
        </Row>
      );
    } else if (scenario.tags.filter((t) => t.startsWith('@id')) > 0
            && (!scenario.testCases || scenario.testCases === 0)) {
      const color = this.getColor(0);

      row = (
        <Row style={{ padding: '8px', paddingLeft: '10px', border: '1px solid #ddd', backgroundColor: color }}>
          <Col md={4} key='title'>{scenario.scenarioName}</Col>
          <Col md={8}>Incorrect tags: {scenario.tags.filter((t) => t.startsWith('@id')).join(', ')}</Col>
        </Row>
      );
    } else {
      row = (
        <Row style={{ padding: '8px', paddingLeft: '10px', border: '1px solid #ddd', backgroundColor: '#ccc' }}>
          <Col md={12} key='title'>{scenario.scenarioName}</Col>
        </Row>
      );
    }

    return row;
  }
}

ScenarioPanel.propTypes = propTypes;

export default ScenarioPanel;
