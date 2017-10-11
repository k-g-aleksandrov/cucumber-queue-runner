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
              <th rowSpan={2}>
                <div>Feature</div>
              </th>
              <th colSpan={3}>Scenarios</th>
            </tr>
            <tr>
              <th className='passed'><div>Passed</div></th>
              <th className='failed'><div>Failed</div></th>
              <th className='total'><div>Total</div></th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, featureKey) => {
              if (!feature.scenarios) {
                return null;
              }
              const totalScenarios = feature.passedScenarios + feature.failedScenarios;

              return (
                <tr key={featureKey}>
                  <td style={{ textAlign: 'left' }}>
                    <Link to={`/sessions/history/${sessionId}/features/${feature._id}`}>{feature.name}</Link>
                  </td>
                  <td className={feature.passedScenarios > 0 ? 'passed' : ''}>
                    {feature.passedScenarios}
                  </td>
                  <td className={feature.failedScenarios > 0 ? 'failed' : ''}>
                    {feature.failedScenarios}
                  </td>
                  <td className={totalScenarios > 0 ? 'total' : ''}>{totalScenarios}</td>
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
