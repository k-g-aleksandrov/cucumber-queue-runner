import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ScenarioRow from './ScenarioRow';

import Table from 'react-bootstrap/lib/Table';

import { fetchScopeScenarios } from 'redux/actions/projectsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  filter: PropTypes.any.isRequired,
  project: PropTypes.any.isRequired,
  scopes: PropTypes.any
};

class ScopeDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: !this.props.filter.hideInUi
    };

    this.fetchScopeScenarios = this.fetchScopeScenarios.bind(this);
  }

  componentDidMount() {
    this.fetchScopeScenarios();
  }

  fetchScopeScenarios() {
    this.props.dispatch(fetchScopeScenarios(this.props.project, this.props.filter.id));
  }

  render() {
    const { scopes, filter } = this.props;

    const scope = scopes[filter.id];

    console.log(scope);
    let body = null;

    if (!scope.loaded) {
      return (
        <Table style={{ boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)' }} striped bordered>
          <thead style={{ backgroundColor: '#d9edf7', borderColor: '#bce8f1' }}>
            <tr>
              <th colSpan='3'>
                <h4>
                  {scope.filter.displayName} - loading scenarios...
                </h4>
                <span
                  style={{ fontSize: 'small', fontWeight: 'normal', fontStyle: 'italic' }}
                >{scope.filter.description}</span>
              </th>
            </tr>
          </thead>
        </Table>
      );
    }
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

function mapStateToProps(state) {
  const { scopes } = state.project.projectDetails;

  return { scopes };
}

ScopeDetails.propTypes = propTypes;

export default connect(mapStateToProps)(ScopeDetails);
