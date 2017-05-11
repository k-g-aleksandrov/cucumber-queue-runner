import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import moment from 'moment';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Table from 'react-bootstrap/lib/Table';
import Grid from 'react-bootstrap/lib/Grid';

import Spinner from 'components/Spinner';
import SessionHistoryScenarioRow from './SessionHistoryScenarioRow';

import { fetchSessionsHistory } from 'redux/actions/sessionsActions';

let Doughnut;

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
  sessionsHistory: PropTypes.any,
  params: PropTypes.object
};

class SessionHistoryPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Doughnut = require('react-chartjs-2').Doughnut;
    this.fetchSessionsHistory();
  }

  fetchSessionsHistory() {
    this.props.dispatch(fetchSessionsHistory());
  }

  render() {
    const sessionId = this.props.params.session;

    const { sessionsHistory } = this.props;

    if (!sessionsHistory) {
      return <Spinner/>;
    }

    const session = sessionsHistory.find(o => o.details.sessionId === sessionId);

    if (!session) {
      this.props.router.push(`/sessions?lost=${sessionId}`);
    }

    const chartData = {
      labels: [
        `Passed (${session.briefStatus.passedCount})`,
        `Failed (${session.briefStatus.failedCount})`,
        `Skipped (${session.briefStatus.skippedCount})`
      ],
      datasets: [
        {
          data: [
            session.briefStatus.passedCount,
            session.briefStatus.failedCount,
            session.briefStatus.skippedCount
          ],
          backgroundColor: [
            '#92DD96',
            '#F2928C',
            'lightgray'
          ],
          hoverBackgroundColor: [
            '#92DD96',
            '#F2928C',
            'lightgray'
          ]
        }
      ]
    };

    return (
      <Grid fluid>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={4}>
            <Table>
              <thead>
                <tr>
                  <td colSpan={2}><h2>Session Details</h2></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Project</th>
                  <td>{session.details.project}</td>
                </tr>
                <tr>
                  <th>Started</th>
                  <td>
                    {moment(new Date()).to(moment(session.details.startDate))}
                    <br/>
                    <span style={{ fontSize: '90%', fontStyle: 'italic' }}>
                      {moment(session.details.startDate).format('DD.MM.YYYY HH:mm:ss')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Session ID</th>
                  <td>{session.details.sessionId}</td>
                </tr>
                <tr>
                  <th>Scope</th>
                  <td>
                    {session.details.scenariosFilter.scope === 'custom'
                      ? `custom - ${session.details.scenariosFilter.tags}`
                      : session.details.scenariosFilter.scope}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={8}>
            <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
            {Doughnut !== undefined && <Doughnut data={chartData} height={70}/>}
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Table bordered style={{ marginBottom: '0px' }}>
              {Object.keys(session.scenarios).map((feature, i) => {
                return (
                  <tbody key={i}>
                    <tr>
                      <th>{feature}</th>
                    </tr>
                    {session.scenarios[feature].map((scenario, j) => {
                      return <SessionHistoryScenarioRow key={j} session={session} scenario={scenario}/>;
                    })}
                  </tbody>
                );
              })}
            </Table>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  const { sessionsHistory } = state.sessions;

  return { sessionsHistory };
}


SessionHistoryPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionHistoryPage);
