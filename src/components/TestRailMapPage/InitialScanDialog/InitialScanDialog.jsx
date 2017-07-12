import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap-button-loader';

import './InitialScanDialog.css';

const propTypes = {
  onScanStarted: PropTypes.any
};

class InitialScanDialog extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id='initialScanDialog'>
        <h3>Project was never scanned</h3>
        <Button bsStyle='primary' onClick={this.props.onScanStarted}>Do First Scan</Button>
      </div>
    );
  }
}

InitialScanDialog.propTypes = propTypes;

export default InitialScanDialog;
