import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'react-bootstrap';

import ProjectsTableRow from './ProjectsTableRow';

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
      availableProjects: [],
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
    const { availableProjects } = this.props;

    return (
      <Table striped bordered style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }}>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>&nbsp;</th>
          </tr>
          {availableProjects.map((project, i) => {
            return <ProjectsTableRow key={i} project={project}/>;
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
