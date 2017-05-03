import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Panel, Grid } from 'react-bootstrap';

import ScenarioRow from './ScenarioRow';

const propTypes = {
  scope: PropTypes.any.isRequired
};

class ScopeDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }

  render() {
    const { scope } = this.props;

    const title = (
      <div onClick={() => this.setState({ open: !this.state.open })}>
        <h4>{scope.filter.displayName}</h4>
        <span style={{ fontSize: 'small', fontStyle: 'italic' }}>{scope.filter.description}</span>
      </div>
    );

    if (scope.scenarios.length) {
      return (
        <Panel
          style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }}
          header={title}
          bsStyle='info' collapsible
          expanded={this.state.open}
        >
          <Grid fluid>
            {scope.scenarios.map((scenario, sI) => <ScenarioRow key={sI} index={sI} scenario={scenario}/>)}
          </Grid>
        </Panel>
      );
    }
    return (
      <Panel header={title} bsStyle='default'>
        <h4>No scenarios found by filter '{scope.filter.displayName}'</h4>
      </Panel>
    );
  }
}

ScopeDetails.propTypes = propTypes;

export default connect()(ScopeDetails);
