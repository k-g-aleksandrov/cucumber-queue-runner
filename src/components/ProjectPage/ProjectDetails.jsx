import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  projectDetails: PropTypes.any.isRequired
};

class ProjectDetails extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { projectDetails } = this.props;

    return (
      <div className='info-panel'>
        <h2>{projectDetails.name}</h2>
        <div className='details-row'>
          <span className='details-row-title'>ID</span>
          <span className='details-row-value'>{projectDetails.id}</span>
        </div>
        <div className='details-row'>
          <span className='details-row-title'>Description</span>
          <span className='details-row-value'>{projectDetails.description}</span>
        </div>
        <div className='details-row'>
          <span className='details-row-title'>Project Tag</span>
          <div className='details-row-value'>{projectDetails.tag}</div>
        </div>
        <div className='details-row'>
          <span className='details-row-title'>Working Copy Path</span>
          <div className='details-row-value'>{projectDetails.workingCopyPath}</div>
        </div>
      </div>
    );
  }
}

ProjectDetails.propTypes = propTypes;

export default ProjectDetails;
