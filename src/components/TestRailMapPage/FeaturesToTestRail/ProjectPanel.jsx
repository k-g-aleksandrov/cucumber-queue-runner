import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row } from 'react-bootstrap';

import FeaturePanel from './FeaturePanel';

const propTypes = {
  project: PropTypes.any
};

class ProjectPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { project } = this.props;

    return (
      <Row style={{ marginBottom: '20px', boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)', border: '1px solid #ddd' }}>
        <Grid fluid>
          <Row style={{ backgroundColor: '#8AF', padding: '8px', paddingLeft: '16px' }}>
            <h4>{project.name}</h4>
          </Row>
          {Object.keys(project.features).map((featureName, i) => {
            return <FeaturePanel key={i} feature={project.features[featureName]}/>;
          })}
        </Grid>
      </Row>
    );
  }
}

ProjectPanel.propTypes = propTypes;

export default ProjectPanel;
