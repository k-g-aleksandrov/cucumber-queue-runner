import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { CopyToClipboard } from 'react-copy-to-clipboard';
// import ReactTooltip from 'react-tooltip';

import Report from 'components/SessionPage/Components/Report/Report';

const propTypes = {
  scenario: PropTypes.any,
  sessionId: PropTypes.any,
  failed: PropTypes.bool,
  history: PropTypes.bool
};

class DoneScenarioRow extends Component {

  constructor(props) {
    super(props);

    this.state = {
      report: null,
      reportDisplayed: false
    };

    this.handleGetScenarioReportClick = this.handleGetScenarioReportClick.bind(this);
  }

  handleGetScenarioReportClick(sessionId, scenarioId) {
    if (!this.props.history) {
      if (this.state.report === null) {
        fetch(`/api/sessions/${sessionId}/reports/${scenarioId}`)
          .then((response) => response.json())
          .then((responseJson) => {
            this.setState({ report: responseJson.report });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    this.setState({ reportDisplayed: !this.state.reportDisplayed });
  }

  render() {
    const { sessionId, scenario } = this.props;

    let backgroundColor = 'white';

    if (scenario.result === 'passed') {
      backgroundColor = '#92DD96';
    } else if (scenario.result === 'failed') {
      backgroundColor = '#F2928C';
    } else if (scenario.result === 'skipped') {
      backgroundColor = 'lightgray';
    }

    if (scenario.result === 'skipped') {
      return (
        <div style={{ backgroundColor, marginLeft: '16px', padding: '8px' }}>
          <span>
            {scenario.scenarioName}&nbsp;
            <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
          </span>
        </div>
      );
    }

    let report;
    let feature;
    let tags;

    if (this.props.history) {
      feature = scenario.report[0].name;
      report = scenario.report;
      if (scenario.report[0].elements[0].tags) {
        tags = scenario.report[0].elements[0].tags.map((tag) => tag.name)
          .filter((tag) => tag.startsWith('@id'));
      }
    } else {
      feature = scenario.featureName;
      report = this.state.report;
    }

    return (
      <div>
        <div onClick={() => {
          this.handleGetScenarioReportClick(sessionId, scenario.scenarioId);
        }} style={{ backgroundColor, marginLeft: '16px', padding: '8px', cursor: 'pointer', overflow: 'hidden' }}
        >
          <span>
            {this.props.failed && <b>{feature}: </b>}
            {
              <span>
                {scenario.scenarioName}&nbsp;
                {tags && tags.length > 0 &&
                  <span className='report-test-id' onClick={(e) => e.stopPropagation()}>
                    [&nbsp;{tags.map((tag, i) => {
                      return (
                        <span key={i}>
                          <CopyToClipboard text={tag}>
                            <a onCopy={(e) => {
                              console.log('tag');
                              e.stopPropagation();
                            }}
                            >
                              {tag}&nbsp;
                            </a>
                          </CopyToClipboard>
                        </span>
                      );
                    })}]&nbsp;
                  </span>
                }
                <span className='report-scenario-line'>line {scenario.scenarioLine}</span>
              </span>
            }
          </span>
          <span style={{ float: 'right' }}>{scenario.executor}</span>
        </div>
        <div style={{ marginLeft: '32px' }}>
          {this.state.reportDisplayed && <Report report={report} sessionId={sessionId}/>}
        </div>
        <hr style={{ margin: '0px', marginLeft: '16px', borderTop: '1px solid #eeeeee' }}/>
      </div>
    );
  }
}

DoneScenarioRow.propTypes = propTypes;

export default connect()(DoneScenarioRow);
