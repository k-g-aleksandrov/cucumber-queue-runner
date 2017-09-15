import React, { Component } from 'react';
import PropTypes from 'prop-types';

import base64 from 'base-64';

const propTypes = {
  embedding: PropTypes.any,
  index: PropTypes.any
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
    const { embedding, index } = this.props;

    return (
      <div>
        <a onClick={this.handleShowAttachment}>Attachment {index + 1} ({embedding.mime_type})</a>
        {this.state.extend && <pre>{base64.decode(embedding.data)}</pre>}
      </div>
    );
  }
}

ReportAttachment.propTypes = propTypes;

export default ReportAttachment;
