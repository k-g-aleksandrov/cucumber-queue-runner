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

    this.state = {
      showSections: true
    };
  }

  handleShowSectionsClick() {
    this.setState({ showSections: !this.state.showSections });
  }

  render() {
    const { suite } = this.props;

    return (
      <Row style={{ marginBottom: '20px', boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)', border: '1px solid #ddd' }}>
        <Grid fluid>
          <Row
            onClick={() => {
              this.handleShowSectionsClick();
            }}
            style={{
              backgroundColor: '#d9edf7',
              padding: '8px',
              paddingLeft: '16px',
              cursor: 'pointer'
            }}
          >
            <h4>{suite.name}</h4>
          </Row>
          {this.state.showSections && Object.keys(suite.sections).map((sectionName, i) => {
            return <SectionPanel key={i} section={suite.sections[sectionName]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

SuitePanel.propTypes = propTypes;

export default SuitePanel;
