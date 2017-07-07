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
      <Row>
        <Grid fluid>
          <Row>{suite.name}</Row>
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
