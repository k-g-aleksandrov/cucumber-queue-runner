import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row } from 'react-bootstrap';

import SectionPanel from './SectionPanel';

const propTypes = {
  suite: PropTypes.any
};

class SuitePanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { suite } = this.props;

    return (
      <Row style={{ paddingBottom: '20px', boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }}>
        <Grid fluid>
          <Row style={{ padding: '8px', border: '1px solid #ddd' }}>
            <h4>{suite.name}</h4>
          </Row>
          {Object.keys(suite.sections).map((sectionName, i) => {
            return <SectionPanel key={i} section={suite.sections[sectionName]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

SuitePanel.propTypes = propTypes;

export default SuitePanel;
