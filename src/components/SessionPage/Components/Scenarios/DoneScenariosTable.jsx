import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Alert from 'react-bootstrap/lib/Alert';

import SessionHistoryScenarioRow from './DoneScenarioRow';

const propTypes = {
  sessionId: PropTypes.any,
  sessionScenarios: PropTypes.any,
  history: PropTypes.bool
};

class DoneScenariosTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionId, sessionScenarios, history } = this.props;

    return (
      <div>
        {sessionScenarios && Object.keys(sessionScenarios).map((feature, i) => {
          return (
            <div key={i}>
              <h4 style={{ margin: '4px' }}>
                <span>{feature}</span>
              </h4>
              {sessionScenarios[feature].map((scenario, j) => {
                return (
                  <SessionHistoryScenarioRow
                    key={j}
                    sessionId={sessionId}
                    scenario={scenario}
                    failed={false}
                    history={history}
                  />
                );
              })}
              <hr style={{ marginLeft: '8px' }}/>
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

DoneScenariosTable.propTypes = propTypes;

export default DoneScenariosTable;
