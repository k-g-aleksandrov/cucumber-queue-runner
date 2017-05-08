import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-bootstrap-button-loader';

import { scanProject, deleteProject } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  project: PropTypes.any
};

class ProjectsTableRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      enableDelete: false
    };

    this.handleRescanProjectClick = this.handleRescanProjectClick.bind(this);
    this.handleDeleteProjectClick = this.handleDeleteProjectClick.bind(this);
  }

  handleRescanProjectClick(projectId) {
    this.props.dispatch(scanProject(projectId));
  }

  handleDeleteProjectClick(projectId) {
    this.props.dispatch(deleteProject(projectId));
  }

  render() {
    const { project } = this.props;

    return (
      <tr>
        <td>
          <Link to={`/projects/${project.projectId}`}>{project.name}</Link>
        </td>
        <td>
          <span>{project.description}</span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Button bsStyle='primary' onClick={() => this.handleRescanProjectClick(project.projectId)}>
            Rescan Project
          </Button>
          <span>&nbsp;</span>
          {this.state.enableDelete &&
          <Button bsStyle='danger' onClick={() => this.handleDeleteProjectClick(project.projectId)}>
            Delete Project
          </Button>
          }
        </td>
      </tr>
    );
  }
}

ProjectsTableRow.propTypes = propTypes;

export default connect()(ProjectsTableRow);
