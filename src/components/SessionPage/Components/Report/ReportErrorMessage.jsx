import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  errorMessage: PropTypes.any
};

class ReportErrorMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };

    this.handleExpandErrorMessage = this.handleExpandErrorMessage.bind(this);
  }

  handleExpandErrorMessage() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { errorMessage } = this.props;

    if (!errorMessage) {
      return null;
    }

    if (this.state.expanded) {
      return (
        <pre
          onClick={() => this.handleExpandErrorMessage()}
          style={{ backgroundColor: '#eee', margin: '16px', border: '1px solid #ccc' }}
        >
          {errorMessage}
        </pre>
      );
    }
    return (
      <pre style={{ margin: '16px', textOverflow: 'ellipsis' }}>
        <a onClick={() => this.handleExpandErrorMessage()}>
          {errorMessage.split('\n')[0]}
        </a>
      </pre>
    );
  }
}

ReportErrorMessage.propTypes = propTypes;

export default ReportErrorMessage;
