import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const propTypes = {
  doShow: PropTypes.bool,
  onHide: PropTypes.func
};

class AddProjectModal extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal show={this.props.doShow} onHide={this.props.onHide}>
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
          <button className='btn btn-default pull-left' type='submit' onClick={this.props.onHide}>
            <span className='glyphicon glyphicon-remove'/>
            <span>&nbsp;Cancel</span>
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AddProjectModal.propTypes = propTypes;

export default AddProjectModal;
