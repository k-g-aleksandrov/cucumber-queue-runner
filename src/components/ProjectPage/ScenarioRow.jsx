import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updateScenarioNote } from 'redux/actions/projectsActions';

import './ScenarioRow.css';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  index: PropTypes.any,
  scenario: PropTypes.any.isRequired
};

class ScenarioRow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newNoteButtonOpacity: 0.1,
      showNewNoteModal: false,
      scenarioNote: this.props.scenario.note
    };

    this.renderNote = this.renderNote.bind(this);
    this.handleShowNewNoteButton = this.handleShowNewNoteButton.bind(this);
    this.handleHideNewNoteButton = this.handleHideNewNoteButton.bind(this);
    this.handleShowNoteModal = this.handleShowNoteModal.bind(this);
    this.handleHideNoteModal = this.handleHideNoteModal.bind(this);
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

  handleShowNoteModal() {
    this.setState({ showNewNoteModal: true });
  }

  handleHideNoteModal(newNote) {
    this.setState({ showNewNoteModal: false, scenarioNote: newNote });
    this.props.dispatch(updateScenarioNote(this.props.scenario._id, newNote));
  }

  handleMoveCaretAtEndOfInput(event) {
    const tempValue = event.target.value;
    const eventTarget = event.target;

    eventTarget.value = '';
    eventTarget.value = tempValue;
  }

  renderNote(scenarioNote) {
    let noteBlock;

    if (scenarioNote && this.state.showNewNoteModal) {
      noteBlock = (
        <div style={{ verticalAlign: 'center', whitespace: 'nowrap' }}>
          <input autoFocus type='text' defaultValue={scenarioNote}
            onBlur={(event) => {
              this.handleHideNoteModal(event.target.value);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                this.handleHideNoteModal(event.target.value);
              }
            }}
            onFocus={this.handleMoveCaretAtEndOfInput}
            style={{ width: '95%' }}
          />
          <a onClick={this.handleShowNoteModal}><span className='glyphicon glyphicon-pencil'/></a>
        </div>
      );
    } else if (scenarioNote && !this.state.showNewNoteModal) {
      noteBlock = (
        <div style={{ verticalAlign: 'center', whitespace: 'nowrap' }}>
          <span style={{ fontStyle: 'italic', opacity: '0.7' }}>{scenarioNote}</span>
          <a onClick={this.handleShowNoteModal} style={{ marginLeft: '8px' }}>
            <span className='glyphicon glyphicon-pencil'/>
          </a>
        </div>
      );
    } else if (!scenarioNote && this.state.showNewNoteModal) {
      noteBlock = (
        <div style={{ verticalAlign: 'center', whitespace: 'nowrap' }}>
          <input autoFocus type='text'
            onBlur={(event) => {
              this.handleHideNoteModal(event.target.value);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                this.handleHideNoteModal(event.target.value);
              }
            }}
            style={{ width: '95%' }}
          />
        </div>
      );
    } else if (!scenarioNote && !this.state.showNewNoteModal) {
      noteBlock = (
        <a
          onClick={this.handleShowNoteModal}
          style={{ marginLeft: '8px', opacity: this.state.newNoteButtonOpacity }}
        >
          <span className='glyphicon glyphicon-pencil'/>
        </a>
      );
    }
    return noteBlock;
  }

  render() {
    const { scenario } = this.props;
    const scenarioNote = this.state.scenarioNote;

    return (
      <tr className='project-scenario-row'
        onMouseEnter={this.handleShowNewNoteButton}
        onMouseLeave={this.handleHideNewNoteButton}
      >
        <td style={{ textAlign: 'center', verticalAlign: 'center' }}>
          {this.props.index + 1}
        </td>
        <td>
          <span style={{ fontWeight: 'bold' }}>{scenario.featureName}:&nbsp;</span>
          {scenario.scenarioName} (:{scenario.scenarioLine})
          {this.renderNote(scenarioNote)}
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
      </tr>
    );
  }
}

ScenarioRow.propTypes = propTypes;

export default connect()(ScenarioRow);
