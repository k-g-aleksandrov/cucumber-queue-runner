import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import DoneScenarioRow from 'components/SessionPage/Components/Scenarios/DoneScenarioRow';

import { Link } from 'react-router';

import { fetchSessionFeatureHistory } from 'redux/actions/sessionsActions';

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  sessionId: PropTypes.any,
  params: PropTypes.any,
  sessionsHistory: PropTypes.any
};

class SessionFeatureHistoryPage extends Component {

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.fetchSessionFeatureHistory();
  }

  fetchSessionFeatureHistory() {
    this.props.dispatch(fetchSessionFeatureHistory(this.props.params.session, this.props.params.feature));
  }

  render() {
    const { sessionsHistory } = this.props;

    const feature = sessionsHistory[this.props.params.session].features.find((element) => {
      return element._id === this.props.params.feature;
    });

    return (
      <div className='info-panel'>
        <Link to={`/sessions/history/${feature.sessionId}`}>&lt; Back to Features</Link>
        <h3>{feature.name}</h3>
        {feature.scenarios.map((scenario, j) => {
          if (!scenario.scenario) {
            return null;
          }
          return (
            <DoneScenarioRow
              key={j}
              sessionId={feature.sessionId}
              scenario={scenario.scenario}
              failed={false}
              history
            />
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { sessionsHistory } = state.sessions;

  return { sessionsHistory };
}

SessionFeatureHistoryPage.propTypes = propTypes;

export default connect(mapStateToProps)(SessionFeatureHistoryPage);
