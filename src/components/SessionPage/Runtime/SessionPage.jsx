import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Grid from 'react-bootstrap/lib/Grid';

import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import Spinner from 'components/common/Spinner';
import SessionDetails from 'components/SessionPage/Components/SessionDetails';
import SessionStatusChart from 'components/SessionPage/Components/SessionStatusChart';

import { fetchSessionDetails, skipScenario } from 'redux/actions/sessionsActions';

import QueueScenariosTable from 'components/SessionPage/Components/Scenarios/QueueScenariosTable';
import InProgressScenariosTable from 'components/SessionPage/Components/Scenarios/InProgressScenariosTable';
import DoneScenariosTable from 'components/SessionPage/Components/Scenarios/DoneScenariosTable';
import FailedScenariosTable from 'components/SessionPage/Components/Scenarios/FailedScenariosTable';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
  availableSessions: PropTypes.any,
  params: PropTypes.object
};

class SessionPage extends Component {

  constructor(props) {
    super(props);

    this.handleSkipScenarioClick = this.handleSkipScenarioClick.bind(this);
  }

  componentDidMount() {
    this.fetchSessionDetails();

    this.timerID = setInterval(
      () => this.fetchSessionDetails(),
      5000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  handleSkipScenarioClick(sessionId, scenarioId) {
    this.props.dispatch(skipScenario(sessionId, scenarioId));
    this.fetchSessionDetails();
  }

  fetchSessionDetails() {
    this.props.dispatch(fetchSessionDetails(this.props.params.session));
  }

  filterFailedScenarios(scenarios) {
    const filteredScenarios = {};

    for (const feature of Object.keys(scenarios)) {
      const featureScenarios = scenarios[feature].filter((scenario) => {
        return scenario.result === 'failed';
      });

      if (featureScenarios && featureScenarios.length) {
        filteredScenarios[feature] = featureScenarios;
      }
    }
    return filteredScenarios;
  }

  render() {
    const sessionId = this.props.params.session;
    const queryParams = this.props.location.query;

    const { availableSessions } = this.props;
    const session = availableSessions[sessionId];

    if (session && session.error) {
      this.props.router.push(`/sessions?lost=${sessionId}`);
    }

    if (!session || !session.status || !session.details) {
      return <Spinner/>;
    }

    const activeTab = queryParams.tab ? queryParams.tab : 'queue';

    return (
      <Grid style={{ paddingBottom: '20px' }}>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={5}>
            <SessionDetails sessionDetails={session.details} history={false}/>
          </Col>
          <Col md={7}>
            <SessionStatusChart sessionBriefStatus={session.briefStatus}/>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <div className='info-panel'>
              <h2>Scenarios</h2>
              <Tabs
                id='tabs-with-dropdown'
                defaultActiveKey={activeTab}
                animation={false}
              >
                <Nav bsStyle='tabs'>
                  <LinkContainer to={`/sessions/${sessionId}?tab=queue`}>
                    <NavItem eventKey='queue'>Queue</NavItem>
                  </LinkContainer>
                  <LinkContainer to={`/sessions/${sessionId}?tab=progress`}>
                    <NavItem eventKey='progress'>In Progress</NavItem>
                  </LinkContainer>
                  <LinkContainer to={`/sessions/${sessionId}?tab=done`}>
                    <NavItem eventKey='done'>Done</NavItem>
                  </LinkContainer>
                  <LinkContainer to={`/sessions/${sessionId}?tab=failed`}>
                    <NavItem eventKey='failed'>Failed</NavItem>
                  </LinkContainer>
                </Nav>
                <Row className='clearfix' style={{ paddingTop: '16px' }}>
                  <Col sm={12}>
                    <Tab.Content>
                      <Tab.Pane eventKey='queue'>
                        <QueueScenariosTable
                          onSkip={this.handleSkipScenarioClick}
                          scenarios={session.status.queue}
                          sessionId={sessionId}
                        />
                      </Tab.Pane>
                      <Tab.Pane eventKey='progress'>
                        <InProgressScenariosTable
                          scenarios={session.status.inProgress}
                          sessionId={sessionId}
                        />
                      </Tab.Pane>
                      <Tab.Pane eventKey='done'>
                        <DoneScenariosTable
                          sessionScenarios={session.status.done}
                          sessionId={sessionId}
                        />
                      </Tab.Pane>
                      <Tab.Pane eventKey='failed'>
                        <FailedScenariosTable
                          sessionScenarios={this.filterFailedScenarios(session.status.done)}
                          sessionId={sessionId}
                        />
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { availableSessions } = state.sessions;

  return { availableSessions };
}

SessionPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionPage);
