import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';

import ScenariosColumn from './ScenariosColumn';

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

  render() {
    const { testCase, doShowNotCovered } = this.props;

    let row = null;

    if (testCase.scenarios && testCase.scenarios.length > 0) {
      const color = this.getColor(testCase.similarity);

      row = (
        <Row style={{
          padding: '8px',
          paddingLeft: '10px',
          borderTop: '1px solid #cdcdcd',
          borderLeft: '1px solid #cdcdcd',
          backgroundColor: color
        }}
        >
          <Col md={4} key='title'><i>C{testCase.id}:&nbsp;</i>{testCase.title}</Col>
          <Col md={8}><ScenariosColumn scenarios={testCase.scenarios}/></Col>
        </Row>
      );
    } else if (doShowNotCovered) {
      row = (
        <Row style={{ padding: '8px', paddingLeft: '10px', border: '1px solid #cdcdcd', backgroundColor: '#ddd' }}>
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
