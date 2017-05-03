import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ScopeDetails from './ScopeDetails';

import { fetchProjectFilters } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  projectDetails: PropTypes.any,
  params: PropTypes.object
};

class ProjectPage extends Component {

  constructor(props) {
    super(props);

    this.fetchProjectFilters = this.fetchProjectFilters.bind(this);
  }

  componentDidMount() {
    this.fetchProjectFilters();
  }

  fetchProjectFilters() {
    this.props.dispatch(fetchProjectFilters(this.props.params.project));
  }

  render() {
    if (this.props.loading) {
      return <div>Loading...</div>;
    }
    if (!this.props.projectDetails || !this.props.projectDetails.name) {
      return <div>{this.props.projectDetails}</div>;
    }

    const { projectDetails } = this.props;

    return (
      <div>
        <h2>{projectDetails.name}</h2>
        {projectDetails.description && <em>{projectDetails.description}</em>}
        <div>
          {Object.keys(projectDetails.scopes).map((scope, i) => {
            return <ScopeDetails scope={projectDetails.scopes[scope]} key={i}/>;
          })}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loading, projectDetails } = state.project;

  return { loading, projectDetails };
}

ProjectPage.propTypes = propTypes;

export default connect(mapStateToProps)(ProjectPage);
