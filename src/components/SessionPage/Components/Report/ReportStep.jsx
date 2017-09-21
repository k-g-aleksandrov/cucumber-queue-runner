import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReportStepTitle from './ReportStepTitle';
import ReportAttachment from './ReportAttachment';
import ReportErrorMessage from './ReportErrorMessage';

const propTypes = {
  step: PropTypes.any,
  type: PropTypes.any,
  sessionId: PropTypes.any
};

class ReportStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showEmbeddings: false
    };

    this.handleShowEmbeddings = this.handleShowEmbeddings.bind(this);
  }

  handleShowEmbeddings() {
    this.setState({ showEmbeddings: !this.state.showEmbeddings });
  }

  render() {
    const { step, type, sessionId } = this.props;

    console.log(`ReportStep ${sessionId}`);

    return (
      <div>
        <ReportStepTitle
          onClick={this.handleShowEmbeddings}
          showEmbeddings={this.state.showEmbeddings}
          type={type}
          step={step}
        />
        {this.state.showEmbeddings && step.embeddings &&
          <div
            style={{ margin: '8px 16px 0px' }}
          >
            {step.embeddings.map((embedding, index) => {
              return (
                <ReportAttachment sessionId={sessionId} embedding={embedding} index={index}
                  key={index}
                />
              );
            })}
          </div>
        }
        {step.result && step.result.error_message && <ReportErrorMessage errorMessage={step.result.error_message}/>}
      </div>
    );
  }
}

ReportStep.propTypes = propTypes;

export default ReportStep;
