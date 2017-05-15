import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ScenarioRow from './ScenarioRow';

import Table from 'react-bootstrap/lib/Table';

const propTypes = {
  scope: PropTypes.any.isRequired
};

class ScopeDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: !this.props.scope.filter.hideInUi
    };
  }

  render() {
    const { scope } = this.props;

    let body = null;

    if (scope.scenarios.length) {
      body = (
        <tbody style={{ display: this.state.open ? 'block' : 'none' }}>
          {scope.scenarios.map((scenario, sI) => <ScenarioRow key={sI} index={sI} scenario={scenario}/>)}
        </tbody>
      );
    } else {
      body = (
        <tbody>
          <tr>
            <th>No scenarios found by filter '{scope.filter.displayName}'</th>
          </tr>
        </tbody>
      );
    }

    const title = (
      <thead style={{ backgroundColor: '#d9edf7', borderColor: '#bce8f1' }}
        onClick={() => this.setState({ open: !this.state.open })}
      >
        <tr>
          <th colSpan='3'>
            <h4>{scope.filter.displayName} - {scope.scenarios.length} scenarios</h4>
            <span
              style={{ fontSize: 'small', fontWeight: 'normal', fontStyle: 'italic' }}
            >{scope.filter.description}</span>
          </th>
        </tr>
      </thead>
    );


    return (
      <Table style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }} striped bordered>
        {title}
        {body}
      </Table>
    );
  }
}

ScopeDetails.propTypes = propTypes;

export default connect()(ScopeDetails);
