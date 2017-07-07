import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row } from 'react-bootstrap';

import TestCasePanel from './TestCasePanel';

const propTypes = {
  section: PropTypes.any
};

class SectionPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { section } = this.props;

    return (
      <Row>
        <Grid fluid>
          <Row>{section.name}</Row>
          {Object.keys(section.cases).map((caseTitle, i) => {
            return <TestCasePanel key={i} testCase={section.cases[caseTitle]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

SectionPanel.propTypes = propTypes;

export default SectionPanel;
