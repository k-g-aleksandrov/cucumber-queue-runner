import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router';

const propTypes = {
  activeMode: PropTypes.string
};

class NavigationPanel extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { activeMode } = this.props;

    const links = [
      { mode: 'testrail', label: 'TestRail → Automation' },
      { mode: 'features', label: 'Automation → TestRail (by features)' },
      { mode: 'similarity', label: 'Automation → TestRail (by similarity)' }
    ];
    let current;

    switch (activeMode) {
      case 'features':
        current = 1;
        break;
      case 'similarity':
        current = 2;
        break;
      default:
        current = 0;
        break;
    }

    const rows = [];

    links.map((link, i) => {
      rows.push((i === current)
        ? <h3 key={i} style={{ textAlign: 'center', display: 'inline' }}>{link.label}</h3>
        : <Link key={i} to={`/testrail-map?mode=${link.mode}`} style={{ textAlign: 'center' }}>{link.label}</Link>);
      rows.push(<br key={`line_${i}`}/>);
    });
    return (
      <div>
        {rows}
      </div>
    );
  }
}

NavigationPanel.propTypes = propTypes;

export default NavigationPanel;
