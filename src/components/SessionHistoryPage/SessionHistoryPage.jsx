import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Alert from 'react-bootstrap/lib/Alert';

import Spinner from 'components/common/Spinner';
import SessionDetails from 'components/common/SessionDetails';
import SessionStatusChart from 'components/common/SessionStatusChart';
import ScenariosHistoryTable from './ScenariosHistoryTable';

import { fetchSessionHistory } from 'redux/actions/sessionsActions';

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
    this.fetchSessionsHistory();
  }

  fetchSessionsHistory() {
    this.props.dispatch(fetchSessionHistory(this.props.params.session));
  }

  render() {
    const sessionId = this.props.params.session;

    const { sessionsHistory } = this.props;

    if (!sessionsHistory) {
      return <Spinner/>;
    }

    const session = sessionsHistory[sessionId];

    if (!session) {
      this.props.router.push(`/sessions?lost=${sessionId}`);
    }

    return (
      <Grid fluid>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={4}>
            <SessionDetails sessionDetails={session.details} history/>
          </Col>
          <Col md={8}>
            <span style={{ width: '100%', textAlign: 'center' }}><h2>Execution Status</h2></span>
            <SessionStatusChart sessionBriefStatus={session.briefStatus}/>
          </Col>
        </Row>
        {session.historyScenarios &&
        <Row>
          <Col sm={12}>
            <ScenariosHistoryTable sessionScenarios={session.historyScenarios.scenarios} onlyFailed={false}/>
          </Col>
        </Row>
        }
        {!session.historyScenarios &&
        <Row>
          <Col>
            <Alert bsStyle='info'>No scenarios history</Alert>
          </Col>
        </Row>}
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
