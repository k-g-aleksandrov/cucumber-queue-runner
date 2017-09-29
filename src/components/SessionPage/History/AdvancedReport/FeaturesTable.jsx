import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router';

const propTypes = {
  features: PropTypes.any,
  sessionId: PropTypes.any
};

class FeaturesTable extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { sessionId, features } = this.props;

    return (
      <div className='info-panel'>
        <table className='stats-table'>
          <thead>
            <tr className='header'>
              <th/>
              <th colSpan={3}>Scenarios</th>
              <th colSpan={6}>Steps</th>
              <th colSpan={2}>Totals</th>
            </tr>
            <tr>
              <th>
                <div>Feature</div>
              </th>
              <th className='passed'><div>Passed</div></th>
              <th className='failed'><div>Failed</div></th>
              <th className='total'><div>Total</div></th>
              <th className='passed'><div>Passed</div></th>
              <th className='failed'><div>Failed</div></th>
              <th className='skipped'><div>Skipped</div></th>
              <th className='pending'><div>Pending</div></th>
              <th className='undefined'><div>Undefined</div></th>
              <th className='total'><div>Total</div></th>
              <th><div>Duration</div></th>
              <th><div>Status</div></th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, featureKey) => {
              return (
                <tr key={featureKey}>
                  <td>
                    <Link to={`/sessions/${sessionId}/features/${feature._id}`}>{feature.name}</Link>
                  </td>
                  <td>
                    {feature.scenarios.filter((scenario) => scenario.scenario.result === 'passed').length}
                  </td>
                  <td>
                    {feature.scenarios.filter((scenario) => scenario.scenario.result === 'failed').length}
                  </td>
                  <td>{feature.scenarios.length}</td>
                  <td colSpan={8}>0</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

FeaturesTable.propTypes = propTypes;

export default FeaturesTable;
