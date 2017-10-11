import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Alert from 'react-bootstrap/lib/Alert';

import Spinner from 'components/common/Spinner';
import SessionDetails from 'components/SessionPage/Components/SessionDetails';
import SessionStatusChart from 'components/SessionPage/Components/SessionStatusChart';
import FeaturesTable from 'components/SessionPage/History/AdvancedReport/FeaturesTable';

import { fetchSessionHistory } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.any,
  location: PropTypes.any,
  sessionsHistory: PropTypes.any,
  params: PropTypes.object,
  children: PropTypes.node
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

    let reportPage = null;

    if (this.props.params.feature) {
      reportPage = this.props.children;
    } else if (session.features) {
      reportPage = (
        <Row>
          <Col sm={12}>
            <FeaturesTable
              sessionId={sessionId}
              features={session.features}
            />
          </Col>
        </Row>
      );
    }

    return (
      <div>
        <Row className='show-grid' style={{ paddingBottom: '20px' }}>
          <Col md={5}>
            <SessionDetails sessionDetails={session.details} history/>
          </Col>
          <Col md={7}>
            <SessionStatusChart sessionBriefStatus={session.briefStatus}/>
          </Col>
        </Row>

        {reportPage}

        {!session.features &&
        <Row>
          <Col>
            <Alert bsStyle='info'>No scenarios history</Alert>
          </Col>
        </Row>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { sessionsHistory } = state.sessions;

  return { sessionsHistory };
}

SessionHistoryPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionHistoryPage);
