import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap-button-loader';

import { scanProject, deleteProject } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  projectDetails: PropTypes.any,
  availableProjects: PropTypes.array
};

class ProjectsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      availableProjects: []
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
    const { availableProjects } = this.props;

    return (
      <Table striped bordered style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }}>
        <tbody>
          <tr>
            <th colSpan='3'>Available Projects</th>
          </tr>
          {availableProjects.map((project, i) => {
            return (
              <tr key={i}>
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
                  <Button bsStyle='danger' onClick={() => this.handleDeleteProjectClick(project.projectId)}>
                    Delete Project
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableProjects, projectDetails } = state.projects;

  return { loading, availableProjects, projectDetails };
}

ProjectsTable.propTypes = propTypes;

export default connect(mapStateToProps)(ProjectsTable);