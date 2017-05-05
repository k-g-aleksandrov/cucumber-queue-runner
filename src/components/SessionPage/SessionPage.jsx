import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap-button-loader';
import Tab from 'react-bootstrap/lib/Tab';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Table from 'react-bootstrap/lib/Table';

import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import Spinner from 'components/Spinner';
import DoneScenarioRow from './DoneScenarioRow';

import { fetchSessionDetails, skipScenario } from 'redux/actions/sessionsActions';

let Doughnut;

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  location: PropTypes.any,
  session: PropTypes.any,
  params: PropTypes.object
};

class SessionPage extends Component {

  constructor(props) {
    super(props);

    this.handleSkipScenarioClick = this.handleSkipScenarioClick.bind(this);
  }

  componentDidMount() {
    Doughnut = require('react-chartjs-2').Doughnut;

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
  }

  fetchSessionDetails() {
    this.props.dispatch(fetchSessionDetails(this.props.params.session));
  }

  render() {
    const sessionId = this.props.params.session;
    const queryParams = this.props.location.query;
    const { session } = this.props;

    if (!session) {
      return (
        <Spinner/>
      );
    }

    const chartData = {
      labels: [
        `In Queue (${session.status.queue.length})`,
        `In Progress (${session.status.inProgress.length})`,
        `Passed (${session.status.passed.length})`,
        `Failed (${session.status.failed.length})`,
        `Skipped (${session.status.skipped.length})`
      ],
      datasets: [
        {
          data: [
            session.status.queue.length,
            session.status.inProgress.length,
            session.status.passed.length,
            session.status.failed.length,
            session.status.skipped.length
          ],
          backgroundColor: [
            '#8AF',
            '#F5F28F',
            '#92DD96',
            '#F2928C',
            'lightgray'
          ],
          hoverBackgroundColor: [
            '#8AF',
            '#F5F28F',
            '#92DD96',
            '#F2928C',
            'lightgray'
          ]
        }
      ]
    };

    const activeTab = queryParams.tab ? queryParams.tab : 'queue';

    return (
      <div style={{ width: '100%' }}>
        <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
        <Doughnut data={chartData} height={50}/><br/>
        <Tab.Container id='tabs-with-dropdown' defaultActiveKey={activeTab}>
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
                  <Table bordered style={{ marginBottom: '0px' }}>
                    <tbody>
                      {session.status.inProgress.map((inProgressItem, i) => {
                        return (
                          <tr key={i} style={{ backgroundColor: 'lightgray' }}>
                            <td>
                              <span style={{ fontWeight: 'bold' }}>{inProgressItem.featureName}:&nbsp;</span>
                              <span>{`${inProgressItem.scenarioName} (:${inProgressItem.scenarioLine})`}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Tab.Pane>
                <Tab.Pane eventKey='done'>
                  <Table bordered style={{ marginBottom: '0px' }}>
                    {Object.keys(session.status.done).map((feature, i) => {
                      return (
                        <tbody key={i}>
                          <tr>
                            <th>{feature}</th>
                          </tr>
                          {session.status.done[feature].map((scenario, j) => {
                            return <DoneScenarioRow key={j} session={session} scenario={scenario}/>;
                          })}
                        </tbody>
                      );
                    })}
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loading, session } = state.session;

  return { loading, session };
}

SessionPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionPage);
