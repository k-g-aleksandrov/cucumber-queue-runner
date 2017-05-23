import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import moment from 'moment';

import Button from 'react-bootstrap-button-loader';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Table from 'react-bootstrap/lib/Table';
import Grid from 'react-bootstrap/lib/Grid';

import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import Spinner from 'components/common/Spinner';
import SessionDetails from 'components/common/SessionDetails';
import SessionStatusChart from 'components/common/SessionStatusChart';

import DoneScenarioRow from './DoneScenarioRow';

import { fetchSessionDetails, skipScenario } from 'redux/actions/sessionsActions';

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
      <Grid fluid style={{ paddingBottom: '20px' }}>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={4}>
            <SessionDetails sessionDetails={session.details} history={false}/>
          </Col>
          <Col md={8}>
            <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
            <SessionStatusChart sessionBriefStatus={session.briefStatus}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs id='tabs-with-dropdown' defaultActiveKey={activeTab} animation={false}>
              <Row className='clearfix'>
                <Col sm={12}>
                  <Nav bsStyle='tabs'>
                    <LinkContainer to={`/sessions/${sessionId}?tab=queue`}>
                      <NavItem eventKey='queue'>
                        Queue
                      </NavItem>
                    </LinkContainer>
                    <LinkContainer to={`/sessions/${sessionId}?tab=progress`}>
                      <NavItem eventKey='progress'>
                        In Progress
                      </NavItem>
                    </LinkContainer>
                    <LinkContainer to={`/sessions/${sessionId}?tab=done`}>
                      <NavItem eventKey='done'>
                        Done
                      </NavItem>
                    </LinkContainer>
                  </Nav>
                </Col>
                <Col sm={12}>
                  <Tab.Content>
                    <Tab.Pane eventKey='queue'>
                      <Table bordered style={{ marginBottom: '0px' }}>
                        <tbody>
                          {session.status.queue.map((queueItem, i) => {
                            return (
                              <tr key={i}>
                                <td>
                                  <span style={{ fontWeight: 'bold' }}>{queueItem.featureName}:&nbsp;</span>
                                  <span>{`${queueItem.scenarioName} (:${queueItem.scenarioLine})`}</span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <Button onClick={() => this.handleSkipScenarioClick(sessionId, queueItem.scenarioId)}>
                                    Skip Scenario ->
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Tab.Pane>
                    <Tab.Pane eventKey='progress'>
                      <Grid fluid style={{ border: '1px solid #ddd' }}>
                        <Row>
                          <Col md={10}
                            style={{ padding: '8px', borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd' }}
                          >Scenario</Col>
                          <Col md={2}
                            style={{ padding: '8px', borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd' }}
                          >Taken By</Col>
                        </Row>
                        {session.status.inProgress.map((inProgressItem, i) => {
                          return (
                            <Row key={i} style={{ backgroundColor: 'lightgray' }}>
                              <Col md={10}
                                style={{ padding: '8px', borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd' }}
                              >
                                <span style={{ fontWeight: 'bold' }}>{inProgressItem.featureName}:&nbsp;</span>
                                <span>{`${inProgressItem.scenarioName} (:${inProgressItem.scenarioLine})`}</span>
                              </Col>
                              <Col md={2}
                                style={{ padding: '8px', borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd' }}
                              >
                                {inProgressItem.executor}
                                &nbsp;({moment(new Date()).to(moment(inProgressItem.startTimestamp))})
                              </Col>
                            </Row>
                          );
                        })}
                      </Grid>
                    </Tab.Pane>
                    <Tab.Pane eventKey='done'>
                      <Grid fluid>
                        <Row>
                          <Col>
                            {session.status.done && Object.keys(session.status.done).map((feature, i) => {
                              return (
                                <Grid style={{ border: 'solid 1px #ccc' }} fluid key={i}>
                                  <Row style={{ margin: '2px' }}>
                                    <Col><h4>{feature}</h4></Col>
                                  </Row>
                                  {session.status.done[feature].map((scenario, j) => {
                                    return <DoneScenarioRow key={j} session={session} scenario={scenario}/>;
                                  })}
                                </Grid>
                              );
                            })}
                          </Col>
                        </Row>
                      </Grid>
                    </Tab.Pane>
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
  const { availableSessions } = state.sessions;

  return { availableSessions };
}

SessionPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionPage);
