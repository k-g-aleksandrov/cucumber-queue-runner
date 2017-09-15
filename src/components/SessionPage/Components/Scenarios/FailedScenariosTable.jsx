import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Alert from 'react-bootstrap/lib/Alert';

import SessionHistoryScenarioRow from './DoneScenarioRow';

const propTypes = {
  sessionScenarios: PropTypes.any,
  sessionId: PropTypes.any,
  history: PropTypes.bool
};

class FailedScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionScenarios, sessionId, history } = this.props;

    return (
      <div>
        {sessionScenarios && Object.keys(sessionScenarios).map((feature, i) => {
          return (
            <div key={i}>
              {sessionScenarios[feature].map((scenario, j) => {
                if (scenario.result !== 'failed') {
                  return null;
                }
                return (
                  <SessionHistoryScenarioRow
                    key={j} scenario={scenario} failed
                    sessionId={sessionId} history={history}
                  />
                );
              })}
            </div>
          );
        })}
        {!sessionScenarios || !Object.keys(sessionScenarios).length &&
          <Row>
            <Col>
              <Alert bsStyle='info'>No scenarios</Alert>
            </Col>
          </Row>
        }
      </div>
    );
  }
}

FailedScenariosTable.propTypes = propTypes;

export default FailedScenariosTable;
