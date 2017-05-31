import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Modal } from 'react-bootstrap';
import Button from 'react-bootstrap-button-loader';

import ProjectsTable from './ProjectsTable';

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
      <div>
        {this.props.location.query.lost &&
        <Alert bsStyle='danger'>
          <span style={{ fontWeight: 'bold' }}>Error: </span>
          Project
          <span style={{ fontWeight: 'bold' }}> {this.props.location.query.lost} </span>
          does not exist
        </Alert>
        }
        <h3 style={{ paddingBottom: '10px' }}>Available Projects</h3>
        { (!availableProjects || availableProjects.length === 0) &&
        <Alert bsStyle='info'>No projects registered</Alert>}
        { availableProjects && availableProjects.length > 0 && <ProjectsTable availableProjects={availableProjects}/>}
        <Button bsStyle='info' onClick={this.handleShowAddProjectModal}>Add Project</Button>
        <Modal show={this.state.showAddProjectModal} onHide={this.handleCloseAddProjectModal}>
          <Modal.Header closeButton bsStyle='info'>
            <h4>Add Project</h4>
          </Modal.Header>
          <Modal.Body>
            <form role='form' action='/api/projects/add' method='post'>
              <div className='form-group'>
                <label htmlFor='project-id'>Project ID</label>
                <input className='form-control' id='project-id' name='id'
                  type='text' placeholder='Enter project ID'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='project-display-name'>Display Name</label>
                <input className='form-control' id='project-display-name' name='name'
                  type='text' placeholder='Enter display name'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='working-copy-path'>Working Copy Path</label>
                <input className='form-control' id='working-copy-path' name='wcpath'
                  type='text' placeholder='Enter working copy path'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='features-root-path'>Features Root Path</label>
                <input className='form-control' id='features-root-path' name='frpath'
                  type='text' placeholder='Enter features root path (e.g. src/test/resources/)'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='project-tag'>Project Tag</label>
                <input className='form-control' id='project-tag' name='tag'
                  type='text' placeholder='Only scenarios marked by specified tag are related to project'
                />
              </div>
              <div className='form-group'>
                <label htmlFor='project-description'>Description</label>
                <input className='form-control' id='project-description' name='description'
                  type='textarea' placeholder='Enter description'
                />
              </div>
              <button className='btn btn-default btn-success btn-block' type='submit'>Create</button>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-default pull-left' type='submit' onClick={this.handleCloseAddProjectModal}>
              <span className='glyphicon glyphicon-remove'/>
              <span>&nbsp;Cancel</span>
            </button>
          </Modal.Footer>
        </Modal>
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
