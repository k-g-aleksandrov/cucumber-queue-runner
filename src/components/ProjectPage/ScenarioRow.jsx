import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './ScenarioRow.css';

import Button from 'react-bootstrap-button-loader';

const propTypes = {
  index: PropTypes.any,
  scenario: PropTypes.any.isRequired
};

class ScenarioRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true,
      newNoteButtonOpacity: 0.1
    };

    this.renderNote = this.renderNote.bind(this);
    this.handleShowNewNoteButton = this.handleShowNewNoteButton.bind(this);
    this.handleHideNewNoteButton = this.handleHideNewNoteButton.bind(this);
  }

  handleShowNewNoteButton() {
    this.setState({
      newNoteButtonOpacity: 1
    });
  }
  handleHideNewNoteButton() {
    this.setState({
      newNoteButtonOpacity: 0.1
    });
  }

  renderNote(scenario) {
    if (scenario.note) {
      return (<td style={{ textAlign: 'right', verticalAlign: 'center', whitespace: 'nowrap' }}>
        <span>
          <Button bsStyle='info' style={{ marginRight: '8px' }}><span className='glyphicon glyphicon-plus'/></Button>
        </span>
      </td>);
    }
    if (!scenario.note) {
      return (
        <td
          style={{ textAlign: 'right', verticalAlign: 'center', whitespace: 'nowrap' }}
          onMouseEnter={this.handleShowNewNoteButton}
          onMouseLeave={this.handleHideNewNoteButton}
        >
          <Button
            bsStyle='info'
            disabled={!scenario.note}
            style={{ opacity: this.state.newNoteButtonOpacity }}
          >
            <span className='glyphicon glyphicon-tasks'/>
          </Button>
        </td>
      );
    }
  }

  render() {
    const { scenario } = this.props;

    return (
      <tr className='project-scenario-row'>
        <td style={{ textAlign: 'center', verticalAlign: 'center' }}>
          {this.props.index + 1}
        </td>
        <td>
          <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
          {scenario.scenarioName} (:{scenario.scenarioLine})
        </td>
        <td style={{ textAlign: 'right', verticalAlign: 'center' }}>
          {scenario.executions
            ? scenario.executions.slice(Math.max(scenario.executions.length - 30, 0)).map((execution, eI) => {
              return (
                <span
                  key={eI}
                  style={execution.result === 'passed' ? { color: 'green' } : { color: 'red' }}
                >
                &#x25cf;
              </span>
              );
            })
            : null}
        </td>
        {this.renderNote(scenario)}
      </tr>
    );
  }
}

ScenarioRow.propTypes = propTypes;

export default connect()(ScenarioRow);
