import React from 'react';

import { Panel } from 'react-bootstrap';

function ProjectLoadingScreen() {
  return (
    <div>
      <h2>Loading Project Details...</h2>
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
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'rgba(255,255,255,0.5)',
        padding: 0, margin: 0
      }}
      />
    </div>
  );
}

export default ProjectLoadingScreen;
