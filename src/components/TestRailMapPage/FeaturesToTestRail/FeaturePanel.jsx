import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row } from 'react-bootstrap';

import ScenarioPanel from './ScenarioPanel';

const propTypes = {
  feature: PropTypes.any
};

class FeaturePanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showScenarios: false
    };
  }

  handleShowScenariosClick() {
    this.setState({ showScenarios: !this.state.showScenarios });
  }

  render() {
    const { feature } = this.props;

    return (
      <Row>
        <Grid fluid>
          <Row
            onClick={() => {
              this.handleShowScenariosClick();
            }}
            style={{
              padding: '8px',
              paddingLeft: '10px',
              borderTop: '1px solid #ddd',
              borderLeft: '1px solid #ddd',
              cursor: 'pointer'
            }}
          >
            <h5>{this.state.showScenarios ? '↓  ' : '↳' }&nbsp;{feature.name}</h5>
          </Row>
          {this.state.showScenarios && Object.keys(feature.scenarios).map((scenarioName, i) => {
            return <ScenarioPanel key={i} scenario={feature.scenarios[scenarioName]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

FeaturePanel.propTypes = propTypes;

export default FeaturePanel;
