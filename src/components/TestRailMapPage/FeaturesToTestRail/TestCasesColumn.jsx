import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

const propTypes = {
  testCases: PropTypes.array
};

class TestCasesColumn extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { testCases } = this.props;

    return (
      <Col md={8}>
        <Grid fluid>
          <Row>
            {testCases.map((testCase, i) => {
              return (
                <Col md={12} key={i}>
                  <span>
                    <b>{testCase.suite}</b>&nbsp;→&nbsp;
                    <b>{testCase.section}</b>:&nbsp;
                    {testCase.title}<br/>
                  </span>
                </Col>
              );
            })}
          </Row>
        </Grid>
      </Col>
    );
  }
}

TestCasesColumn.propTypes = propTypes;

export default TestCasesColumn;
