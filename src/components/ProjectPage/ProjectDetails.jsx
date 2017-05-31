import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Table from 'react-bootstrap/lib/Table';

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
      <Table>
        <thead>
          <tr>
            <td colSpan={2}><h2>{projectDetails.name}</h2></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>ID</th>
            <td>{projectDetails.id}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{projectDetails.description}</td>
          </tr>
          <tr>
            <th>Project Tag</th>
            <td>{projectDetails.tag}</td>
          </tr>
          <tr>
            <th>Working Copy Path</th>
            <td>{projectDetails.workingCopyPath}</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

ProjectDetails.propTypes = propTypes;

export default ProjectDetails;
