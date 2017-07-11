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
    let similarity = 1;
    let color = this.getColor(similarity);

    if (scenario.noTagsWarning) {
      color = 'lightgray';
    } else if (scenario.incorrectTags) {
      similarity = 0;
      color = this.getColor(similarity);
    } else if (scenario.testCases) {
      for (const testCase of scenario.testCases) {
        const currentSimilarity = stringSimilarity.compareTwoStrings(scenario.scenarioName, testCase.title);

        similarity = currentSimilarity < similarity ? currentSimilarity : similarity;
        color = this.getColor(similarity);
      }
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
        <TestCasesColumn scenario={scenario}/>
      </Row>
    );
    return row;
  }
}

ScenarioPanel.propTypes = propTypes;

export default ScenarioPanel;
