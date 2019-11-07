import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ScenarioRow from './ScenarioRow';

import { Tab, Table } from 'react-bootstrap';

const propTypes = {
  scope: PropTypes.any.isRequired,
  project: PropTypes.any.isRequired
};

class ScopeDetails extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { scenarios, filter } = this.props.scope;

    let body = null;

    if (scenarios.length) {
      body = (
        <tbody>
          {scenarios.map((scenario, sI) => <ScenarioRow key={sI} index={sI} scenario={scenario}/>)}
        </tbody>
      );
    } else {
      body = (
        <tbody>
          <tr>
            <th>No scenarios found by filter '{filter.displayName}'</th>
          </tr>
        </tbody>
      );
    }

    const title = (
      <thead style={{ backgroundColor: '#d9edf7', borderColor: '#bce8f1' }}>
        <tr>
          <th colSpan='3'>
            <span
              style={{ fontSize: 'small', fontWeight: 'normal', fontStyle: 'italic' }}
            >{filter.description}</span>
          </th>
        </tr>
      </thead>
    );


    return (
      <Tab.Pane eventKey={filter.id}>
        <Table striped bordered>
          {title}
          {body}
        </Table>
      </Tab.Pane>
    );
  }
}

ScopeDetails.propTypes = propTypes;

export default ScopeDetails;
