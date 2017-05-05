import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const propTypes = {
  step: PropTypes.any,
  type: PropTypes.any
};

function ReportStep(props) {
  const { step, type } = props;

  let stepDuration = '';
  let stepClass = 'bg-active';

  if (step.result.duration) {
    stepDuration = moment.utc(step.result.duration / 1000000).format('HH:mm:ss.SSS');
  }
  if (step.result.status === 'passed') {
    stepClass = 'bg-success';
  } else if (step.result.status === 'failed') {
    stepClass = 'bg-danger';
  } else if (step.result.status === 'skipped') {
    stepClass = 'bg-info';
  }

  const rows = [];

  if (type === 'before') {
    rows.push(<span style={{ fontWeight: 'bold' }}>Before&nbsp;</span>);
    rows.push(<span>{step.match.location}</span>);
  } else if (type === 'after') {
    rows.push(<span style={{ fontWeight: 'bold' }}>After&nbsp;</span>);
    rows.push(<span>{step.match.location}</span>);
  } else {
    rows.push(<span style={{ fontWeight: 'bold' }}>{step.keyword}&nbsp;</span>);
    rows.push(<span>{step.name}</span>);
  }

  const errorMessage = step.result.error_message
    ? (
      <pre className='container-fluid' style={{ backgroundColor: '#eee', padding: 0, border: '1px solid #ccc' }}>
        {step.result.error_message}
      </pre>
    )
    : null;

  return (
    <div className={`row ${stepClass}`} style={{ margin: 0 }}>
      <div className='col-md-10'>
        {rows}
      </div>
      <div className='col-md-2'>{stepDuration}</div>
      {errorMessage}
    </div>
  );
}

ReportStep.propTypes = propTypes;

export default ReportStep;
