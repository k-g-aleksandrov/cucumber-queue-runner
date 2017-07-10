import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';

import ScenariosColumn from './ScenariosColumn';

import stringSimilarity from 'string-similarity';

const propTypes = {
  testCase: PropTypes.any,
  doShowNotCovered: PropTypes.bool
};

const defaultProps = {
  doShowNotCovered: true
};

class TestCasePanel extends Component {

  constructor(props) {
    super(props);
  }

  getColor(value) {
    const hue = (value * 120).toString(10);

    return [ `hsl(${hue},100%,76%)` ].join('');
  }

  getSimilarityColor(testCase) {
    let similarity = 1;
    let color = this.getColor(similarity);

    for (const scenario of testCase.scenarios) {
      const newSimilarity = stringSimilarity.compareTwoStrings(testCase.title, scenario.scenarioName);

      similarity = newSimilarity < similarity ? newSimilarity : similarity;
      color = this.getColor(similarity);
    }
    return color;
  }

  render() {
    const { testCase, doShowNotCovered } = this.props;

    let row = null;

    if (testCase.scenarios && testCase.scenarios.length > 0) {
      const color = this.getSimilarityColor(testCase);

      row = (
        <Row style={{
          padding: '8px',
          paddingLeft: '10px',
          borderTop: '1px solid #ddd',
          borderLeft: '1px solid #ddd',
          backgroundColor: color
        }}
        >
          <Col md={4} key='title'>{testCase.title}</Col>
          <ScenariosColumn scenarios={testCase.scenarios}/>
        </Row>
      );
    } else if (doShowNotCovered) {
      row = (
        <Row style={{ padding: '8px', paddingLeft: '10px', border: '1px solid #ddd', backgroundColor: '#ddd' }}>
          <Col md={12} key='title'>{testCase.title}</Col>
        </Row>
      );
    }

    return row;
  }
}

TestCasePanel.propTypes = propTypes;
TestCasePanel.defaultProps = defaultProps;

export default TestCasePanel;
