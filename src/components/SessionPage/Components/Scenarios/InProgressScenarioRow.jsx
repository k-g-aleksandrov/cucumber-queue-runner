import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import RuntimeReport from 'components/SessionPage/Components/Report/RuntimeReport';

import moment from 'moment';

const propTypes = {
  scenario: PropTypes.any,
  sessionId: PropTypes.any
};

class InProgressScenarioRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      report: null,
      reportDisplayed: false
    };

    this.handleShowScenarioRuntimeStateClick = this.handleShowScenarioRuntimeStateClick.bind(this);
  }

  handleShowScenarioRuntimeStateClick() {
    this.setState({ reportDisplayed: !this.state.reportDisplayed });
  }

  render() {
    const { sessionId, scenario } = this.props;

    return (
      <div>
        <div onClick={() => {
          this.handleShowScenarioRuntimeStateClick(sessionId, scenario.scenarioId);
        }} style={{ backgroundColor: 'lightgray', marginLeft: '16px', padding: '8px', cursor: 'pointer', overflow: 'hidden' }}
        >
          <span>
            <b>{scenario.featureName}: </b>
            {
              <span>
                {scenario.scenarioName}&nbsp;
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
              </span>
            }
          </span>
          <span style={{ float: 'right' }}>
            {scenario.executor}
            &nbsp;({moment(new Date()).to(moment(scenario.startTimestamp))})
          </span>
        </div>
        {this.state.reportDisplayed && <RuntimeReport scenarioId={scenario.scenarioId} sessionId={sessionId}/>}
        <hr style={{ margin: '0px', marginLeft: '16px', borderTop: '1px solid #eeeeee' }}/>
      </div>
    );
  }
}

InProgressScenarioRow.propTypes = propTypes;

export default connect()(InProgressScenarioRow);
