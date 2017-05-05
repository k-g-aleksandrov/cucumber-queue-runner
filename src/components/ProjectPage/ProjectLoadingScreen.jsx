import React from 'react';

import { Panel } from 'react-bootstrap';

import Spinner from 'components/Spinner';

function ProjectLoadingScreen() {
  return (
    <div>
      <div>
        <Panel header={<h4>Development</h4>} bsStyle='info'>
          <h4>Loading scenarios for filter 'Development'</h4>
        </Panel>
        <Panel header={<h4>Daily</h4>} bsStyle='info'>
          <h4>Loading scenarios for filter 'Daily'</h4>
        </Panel>
        <Panel header={<h4>Failed</h4>} bsStyle='info'>
          <h4>Loading scenarios for filter 'Failed'</h4>
        </Panel>
        <Panel header={<h4>Full Scope</h4>} bsStyle='info'>
          <h4>Loading scenarios for filter 'Full Scope'</h4>
        </Panel>
        <Panel header={<h4>Disabled</h4>} bsStyle='info'>
          <h4>Loading scenarios for filter 'Disabled'</h4>
        </Panel>
      </div>
      <Spinner/>
    </div>
  );
}

export default ProjectLoadingScreen;
