import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row } from 'react-bootstrap';

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
          <Row>{JSON.stringify(testCase)}</Row>

        </Grid>
      </Row>
    );
  }
}

TestCasePanel.propTypes = propTypes;

export default TestCasePanel;
