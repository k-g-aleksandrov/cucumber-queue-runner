import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap-button-loader';

import moment from 'moment';

const propTypes = {
  testRailMapperDetails: PropTypes.any,
  onRescan: PropTypes.any
};

class RescanPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { testRailMapperDetails } = this.props;

    return (
      <div style={{ float: 'right' }}>
        <Button bsStyle='primary' style={{ float: 'right' }} onClick={this.props.onRescan}>Rescan</Button>
        <span
          style={{
            float: 'right',
            fontStyle: 'italic',
            fontSize: '12px',
            paddingRight: '10px',
            color: '#777'
          }}
        >
          Last scan: {moment(new Date()).to(moment(testRailMapperDetails.mappingDate))}<br/>
          Current state: {testRailMapperDetails.state}
        </span>
      </div>
    );
  }
}

RescanPanel.propTypes = propTypes;

export default RescanPanel;
