import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ScopeDetails from './ScopeDetails';
import ProjectDetails from './ProjectDetails';
import Spinner from 'components/common/Spinner';

import { Grid, Row, Col, Nav, NavItem, Tabs, Tab } from 'react-bootstrap';

import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import { fetchProjectFilters, fetchProjectScenarios, countProjectFilters } from 'redux/actions/projectsActions';
import ProjectScopesChart from './ProjectScopesChart';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
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
    this.fetchProjectCounter();

    const activeTab = this.props.location.query.scope ? this.props.location.query.scope : 'dev';
//    const scopes = ['dev', 'daily', 'muted', 'full', 'disabled'];

    this.fetchProjectScenarios(activeTab, 0);
//    scopes.filter((scope) => scope !== activeTab).map((scope) => {
//      this.fetchProjectScenarios(scope);
//    });
  }

  fetchProjectCounter() {
    this.props.dispatch(countProjectFilters(this.props.params.project));
  }

  fetchProjectFilters() {
    this.props.dispatch(fetchProjectFilters(this.props.params.project));
  }

  fetchProjectScenarios(activeTab) {
    this.props.dispatch(fetchProjectScenarios(this.props.params.project, activeTab, 0));
  }

  render() {
    const projectId = this.props.params.project;
    const queryParams = this.props.location.query;

    const { projectDetails } = this.props;

    if (projectDetails && projectDetails.error) {
      this.props.router.push(`/projects?lost=${projectId}`);
    }

    if (this.props.loading || !projectDetails || !projectDetails.details || !projectDetails.count) {
      return <Spinner/>;
    }

    const activeTab = queryParams.scope ? queryParams.scope : 'dev';

    return (
      <Grid style={{ paddingBottom: '20px' }}>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={5}>
            <ProjectDetails projectDetails={projectDetails.details} history={false}/>
          </Col>
          <Col md={7}>
            <ProjectScopesChart projectDetails={projectDetails}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs
              className='info-panel'
              id='tabs-with-dropdown'
              defaultActiveKey={activeTab}
              animation={false}
            >
              <Row className='clearfix'>
                <Col sm={12}>
                  <Nav bsStyle='tabs'>
                    {Object.keys(projectDetails.scopes).map((scope, i) => {
                      const scopeObject = projectDetails.scopes[scope];

                      return (
                        <LinkContainer
                          key={i}
                          to={`/projects/${projectId}?scope=${scopeObject.filter.id}`}
                          onClick={() => this.fetchProjectScenarios(scopeObject.filter.id, 0)}
                        >
                          <NavItem eventKey={scopeObject.filter.id}>
                            {scopeObject.filter.displayName} ({projectDetails.count[scopeObject.filter.id]})
                          </NavItem>
                        </LinkContainer>
                      );
                    })}
                  </Nav>
                </Col>
                <Col sm={12}>
                  <Tab.Content>
                    {Object.keys(projectDetails.scopes).map((scope, i) => {
                      return (
                        <ScopeDetails
                          scope={projectDetails.scopes[scope]}
                          project={this.props.params.project}
                          key={i}
                        />
                      );
                    })}
                  </Tab.Content>
                </Col>
              </Row>
            </Tabs>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { loading, projectDetails } = state.project;

  return { loading, projectDetails };
}

ProjectPage.propTypes = propTypes;

export default connect(mapStateToProps)(ProjectPage);
