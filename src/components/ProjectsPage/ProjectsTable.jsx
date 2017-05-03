import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Table } from 'react-bootstrap';

const propTypes = {
  availableProjects: PropTypes.array
};

class ProjectsTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      availableProjects: []
    };
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
                  <a className='btn btn-primary' role='button' href={`/api/projects/${project.projectId}/scan`}>
                    Rescan Project
                  </a>
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
  const { loading, availableProjects } = state.projects;

  return { loading, availableProjects };
}

ProjectsTable.propTypes = propTypes;

export default connect(mapStateToProps)(ProjectsTable);
