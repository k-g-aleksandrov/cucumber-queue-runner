import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';

const propTypes = {
  scenario: PropTypes.any
};

class TestCasesColumn extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenario } = this.props;

    let testCasesRow = null;

    if (scenario.testCases) {
      testCasesRow = (
        <Row>
          {scenario.testCases.map((testCase, i) => {
            return (
              <Col md={12} key={i}>
                <span>
                  <b>C{testCase.id} > {testCase.suite}</b>&nbsp;→&nbsp;
                  <b>{testCase.section}:&nbsp;</b>
                  {testCase.title}<br/>
                </span>
              </Col>
            );
          })}
        </Row>
      );
    }

    const noTagsWarningRow = (scenario.noTagsWarning)
      ? <Row><Col md={12}><span><b>No ID tags</b></span></Col></Row>
      : null;

    const incorrectTagsRow = (scenario.incorrectTags)
      ? <Row><Col md={12}><span><b>Missing cases: {scenario.incorrectTags.join(', ')}</b></span></Col></Row>
      : null;

    return (
      <Col md={8}>
        <Grid fluid>
          {testCasesRow}
          {noTagsWarningRow}
          {incorrectTagsRow}
        </Grid>
      </Col>
    );
  }
}

TestCasesColumn.propTypes = propTypes;

export default TestCasesColumn;
