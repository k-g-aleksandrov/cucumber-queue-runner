import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import Button from 'react-bootstrap-button-loader';

import ProjectsTable from './ProjectsTable';
import AddProjectModal from './AddProjectModal';

import { fetchProjects } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.any,
  availableProjects: PropTypes.array,
  params: PropTypes.object,
  children: PropTypes.node
};

class ProjectsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      availableProjects: [],
      showAddProjectModal: false
    };

    this.handleShowAddProjectModal = this.handleShowAddProjectModal.bind(this);
    this.handleCloseAddProjectModal = this.handleCloseAddProjectModal.bind(this);
  }

  componentDidMount() {
    this.fetchProjects();
  }

  componentWillUnmount() {
  }

  handleCloseAddProjectModal() {
    this.setState({ showAddProjectModal: false });
  }

  handleShowAddProjectModal() {
    this.setState({ showAddProjectModal: true });
  }

  fetchProjects() {
    this.props.dispatch(fetchProjects());
  }

  render() {
    const { availableProjects } = this.props;

    if (this.props.params.project) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }
    return (
      <div className='info-panel'>
        {this.props.location.query.lost &&
        <Alert bsStyle='danger'>
          <span style={{ fontWeight: 'bold' }}>Error: </span>
          Project
          <span style={{ fontWeight: 'bold' }}> {this.props.location.query.lost} </span>
          does not exist
        </Alert>
        }

        <h3 style={{ paddingBottom: '10px' }}>Available Projects</h3>

        { (!availableProjects || availableProjects.length === 0)
          && <Alert bsStyle='info'>No projects registered</Alert>
        }

        { availableProjects && availableProjects.length > 0
          && <ProjectsTable availableProjects={availableProjects}/>
        }

        <Button bsStyle='info' onClick={this.handleShowAddProjectModal}>Add Project</Button>

        <AddProjectModal doShow={this.state.showAddProjectModal} onHide={this.handleCloseAddProjectModal}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loading, availableProjects } = state.projects;

  return { loading, availableProjects };
}

ProjectsPage.propTypes = propTypes;

export default connect(mapStateToProps)(ProjectsPage);
