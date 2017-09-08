import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import ReportAttachment from './ReportAttachment';

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
    rows.push(<span key={`${step.line}-keyword`} style={{ fontWeight: 'bold' }}>Before&nbsp;</span>);
    rows.push(<span key={`${step.line}-location`}>{step.match.location}</span>);
  } else if (type === 'after') {
    rows.push(<span key={`${step.line}-keyword`} style={{ fontWeight: 'bold' }}>After&nbsp;</span>);
    rows.push(<span key={`${step.line}-location`}>{step.match.location}</span>);
  } else {
    rows.push(<span key={`${step.line}-keyword`} style={{ fontWeight: 'bold' }}>{step.keyword}&nbsp;</span>);
    rows.push(<span key={`${step.line}-location`}>{step.name}</span>);
  }

  const errorMessage = step.result.error_message
    ? (
      <pre className='container-fluid'
        style={{ backgroundColor: '#eee', margin: '16px', border: '1px solid #ccc' }}
      >
        {step.result.error_message}
      </pre>
    )
    : null;

  return (
    <Row className={`${stepClass}`} style={{ margin: 0 }}>
      <Col md={10}>
        {rows}
        {step.embeddings && step.embeddings.map((embedding, index) => {
          return <ReportAttachment embedding={embedding} key={index}/>;
        })}
      </Col>
      <Col md={2} style={{ textAlign: 'center' }}>{stepDuration}</Col>
      {errorMessage}
    </Row>
  );
}

ReportStep.propTypes = propTypes;

export default ReportStep;
