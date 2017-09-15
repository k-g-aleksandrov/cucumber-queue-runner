import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Row from 'react-bootstrap/lib/Row';

const propTypes = {
  step: PropTypes.any,
  type: PropTypes.any,
  showEmbeddings: PropTypes.bool,
  onClick: PropTypes.func
};

class ReportStepTitle extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { step, type, showEmbeddings, onClick } = this.props;

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

    if (step.embeddings) {
      if (showEmbeddings) {
        rows.push(<span key={`${step.line}-icon`} style={{ fontSize: '70%' }}>&nbsp;▼</span>);
      } else {
        rows.push(<span key={`${step.line}-icon`} style={{ fontSize: '70%' }}>&nbsp;▶</span>);
      }
    }

    rows.push(<span key={`${step.line}-duration`} className='report-duration'>{stepDuration}</span>);
    return (
      <Row
        className={`${stepClass}`}
        onClick={onClick}
        style={{ margin: 0, padding: '2px', cursor: step.embeddings ? 'pointer' : '' }}
      >
        {rows}
      </Row>
    );
  }
}

ReportStepTitle.propTypes = propTypes;

export default ReportStepTitle;
