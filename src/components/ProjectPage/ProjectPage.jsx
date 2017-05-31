import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ScopeDetails from './ScopeDetails';
import Spinner from 'components/common/Spinner';

import { fetchProjectFilters } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
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
    const projectId = this.props.params.project;

    const { projectDetails } = this.props;

    if (projectDetails && projectDetails.error) {
      this.props.router.push(`/projects?lost=${projectId}`);
    }

    if (this.props.loading || !projectDetails || !projectDetails.name) {
      return <Spinner/>;
    }

    return (
      <div>
        <h2>{projectDetails.name}</h2>
        {Object.keys(projectDetails.scopes).map((scope, i) => {
          return (
            <ScopeDetails
              scope={projectDetails.scopes[scope]}
              project={this.props.params.project}
              key={i}
            />
          );
        })}
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
