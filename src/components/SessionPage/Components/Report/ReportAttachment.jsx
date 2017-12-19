import React, { Component } from 'react';
import PropTypes from 'prop-types';

import base64 from 'base-64';

const propTypes = {
  embedding: PropTypes.any,
  index: PropTypes.any,
  sessionId: PropTypes.any
};

class ReportAttachment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      extend: false
    };

    this.handleShowAttachment = this.handleShowAttachment.bind(this);
  }

  handleShowAttachment(e) {
    this.setState({ extend: !this.state.extend });
    e.stopPropagation();
  }

  render() {
    const { embedding, index, sessionId } = this.props;

    console.log(`ReportAttachment ${sessionId}`);

    if (this.state.extend) {
      return (
        <pre onClick={this.handleShowAttachment} style={{ backgroundColor: '#eee', border: '1px solid #ccc' }}>
          {base64.decode(embedding.data)}
          {embedding.mime_type === 'image/url' &&
            <center>
              <a
                onClick={(e) => e.stopPropagation()}
                href={`/results/${sessionId}/${base64.decode(embedding.data)}`}
                target='_blank'
              >
                <img
                  style={{ margin: '8px' }}
                  width='600'
                  src={`/results/${sessionId}/${base64.decode(embedding.data)}`}
                  target='_blank'
                />
              </a>
            </center>
          }
        </pre>
      );
    }
    return (
      <pre style={{ backgroundColor: '#eee', border: '1px solid #ccc' }}>
        <a style={{ cursor: 'pointer' }} onClick={this.handleShowAttachment}>Attachment {index + 1} ({embedding.mime_type})</a>
      </pre>
    );
  }
}

ReportAttachment.propTypes = propTypes;

export default ReportAttachment;
