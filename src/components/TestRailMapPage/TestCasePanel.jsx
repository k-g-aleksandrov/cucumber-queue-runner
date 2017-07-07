import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

const propTypes = {
  testCase: PropTypes.any
};

class TestCasePanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { testCase } = this.props;

    return (
      <Row>
        <Grid fluid>
          <Row>
            <Col md={testCase.scenarios ? 4 : 12}>{testCase.title}</Col>
            {testCase.scenarios.length > 0 && <Col md={8}>{JSON.stringify(testCase.scenarios)}</Col>}
          </Row>
        </Grid>
      </Row>
    );
  }
}

TestCasePanel.propTypes = propTypes;

export default TestCasePanel;
