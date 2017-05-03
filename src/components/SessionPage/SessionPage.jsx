import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap-button-loader';
import { Tab, Row, Col, Nav, NavItem, Table } from 'react-bootstrap';

import { fetchSessionDetails, skipScenario } from 'redux/actions/sessionsActions';

let Doughnut;

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
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
  }

  fetchSessionDetails() {
    this.props.dispatch(fetchSessionDetails(this.props.params.session));
  }

  render() {
    const sessionId = this.props.params.session;

    const { session } = this.props;

    if (!session) {
      return (
        <div>No session</div>
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

    return (
      <div>
        <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
        <Doughnut data={chartData} height={75} style={{ bottomPadding: '10px', height: '50px' }}/>
        <Tab.Container id='tabs-with-dropdown' defaultActiveKey='queue'>
          <Row className='clearfix'>
            <Col sm={12}>
              <Nav bsStyle='tabs'>
                <NavItem eventKey='queue'>
                  Queue
                </NavItem>
                <NavItem eventKey='progress'>
                  In Progress
                </NavItem>
                <NavItem eventKey='done'>
                  Done
                </NavItem>
              </Nav>
            </Col>
            <Col sm={12}>
              <Tab.Content animation>
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
                            <td>
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
                            let backgroundColor = 'white';

                            if (scenario.result === 'passed') {
                              backgroundColor = '#92DD96';
                            } else if (scenario.result === 'failed') {
                              backgroundColor = '#F2928C';
                            } else if (scenario.result === 'skipped') {
                              backgroundColor = 'lightgray';
                            }

                            return (
                              <tr key={j} style={{ backgroundColor }}>
                                <td>
                                  <span>{`${scenario.scenarioName} (:${scenario.scenarioLine})`}</span>
                                </td>
                              </tr>
                            );
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
