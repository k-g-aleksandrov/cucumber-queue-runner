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

    this.state = {
      showTestCases: true
    };
  }

  handleShowSectionTestCasesClick() {
    this.setState({ showTestCases: !this.state.showTestCases });
  }

  render() {
    const { section } = this.props;

    return (
      <Row>
        <Grid fluid>
          <Row
            onClick={() => {
              this.handleShowSectionTestCasesClick();
            }}
            style={{
              padding: '8px',
              paddingLeft: '10px',
              borderTop: '1px solid #ddd',
              borderLeft: '1px solid #ddd',
              cursor: 'pointer'
            }}
          >
            <h5><span style={{ width: '30px' }}>{this.state.showTestCases ? '↓' : '↳' }</span>&nbsp;{section.name}</h5>
          </Row>
          {this.state.showTestCases && Object.keys(section.cases).map((caseTitle, i) => {
            return <TestCasePanel key={i} testCase={section.cases[caseTitle]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

SectionPanel.propTypes = propTypes;

export default SectionPanel;
