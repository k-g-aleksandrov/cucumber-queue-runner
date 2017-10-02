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
              if (!feature.scenarios) {
                return null;
              }
              const totalScenarios = feature.passedScenarios + feature.failedScenarios;
              const totalSteps = feature.passedSteps + feature.failedSteps
                      + feature.skippedSteps + feature.pendingSteps + feature.undefinedSteps;

              return (
                <tr key={featureKey}>
                  <td>
                    <Link to={`/sessions/history/${sessionId}/features/${feature._id}`}>{feature.name}</Link>
                  </td>
                  <td className={feature.passedScenarios > 0 ? 'passed' : ''}>
                    {feature.passedScenarios}
                  </td>
                  <td className={feature.failedScenarios > 0 ? 'failed' : ''}>
                    {feature.failedScenarios}
                  </td>
                  <td className={totalScenarios > 0 ? 'total' : ''}>{totalScenarios}</td>
                  <td className={feature.passedSteps > 0 ? 'passed' : ''}>{feature.passedSteps}</td>
                  <td className={feature.failedSteps > 0 ? 'failed' : ''}>{feature.failedSteps}</td>
                  <td className={feature.skippedSteps > 0 ? 'skipped' : ''}>{feature.skippedSteps}</td>
                  <td className={feature.pendingSteps > 0 ? 'pending' : ''}>{feature.pendingSteps}</td>
                  <td className={feature.undefinedSteps > 0 ? 'undefined' : ''}>{feature.undefinedSteps}</td>
                  <td className={totalSteps > 0 ? 'total' : ''}>{totalSteps}</td>
                  <td>0</td>
                  <td
                    className={feature.failedScenarios > 0 ? 'failed' : 'passed'}
                  >{feature.failedScenarios > 0 ? 'Failed' : 'Passed'}</td>
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
