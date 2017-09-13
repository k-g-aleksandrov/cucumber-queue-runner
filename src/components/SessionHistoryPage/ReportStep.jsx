import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Row from 'react-bootstrap/lib/Row';

import ReportAttachment from './ReportAttachment';

import './SessionHistory.css';

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
    rows.push(<span key={`${step.line}-keyword`} className='report-keyword'>Before</span>);
    rows.push(<span key={`${step.line}-location`}>{step.match.location}</span>);
  } else if (type === 'after') {
    rows.push(<span key={`${step.line}-keyword`} className='report-keyword'>After</span>);
    rows.push(<span key={`${step.line}-location`}>{step.match.location}</span>);
  } else {
    rows.push(<span key={`${step.line}-keyword`} className='report-keyword'>{step.keyword}</span>);
    rows.push(<span key={`${step.line}-location`}>{step.name}</span>);
  }

  const errorMessage = step.result.error_message
    ? (
      <pre style={{ backgroundColor: '#eee', margin: '16px', border: '1px solid #ccc' }}>
        {step.result.error_message}
      </pre>
    )
    : null;

  return (
    <Row className={`${stepClass}`} style={{ margin: 0 }}>
      {rows}
      <span className='report-duration'>{stepDuration}</span>
      {step.embeddings && step.embeddings.map((embedding, index) => {
        return <ReportAttachment embedding={embedding} key={index}/>;
      })}
      {errorMessage}
    </Row>
  );
}

ReportStep.propTypes = propTypes;

export default ReportStep;
