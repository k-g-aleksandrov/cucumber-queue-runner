import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  machine: PropTypes.any
};

class MachineDetailsPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showOutdatedPackages: false
    };

    this.handleShowOutdatedPackages = this.handleShowOutdatedPackages.bind(this);
  }

  componentDidMount() {
  }

  handleShowOutdatedPackages() {
    this.setState({ showOutdatedPackages: !this.state.showOutdatedPackages });
  }

  render() {
    const { machine } = this.props;

    if (!machine) {
      return (
        <div>
          <h1>No machine details</h1>
        </div>
      );
    }

    return (
      <div style={{ border: '1px solid', backgroundColor: '#F0FFFF', padding: '8px', marginBottom: '4px' }}>
        <div>{machine.url.protocol}://{machine.url.ip}:{machine.url.port} ({machine.platform} - {machine.version})</div>
        {Object.keys(machine.browsers).map((browser, i) => {
          return <div key={i}>{JSON.stringify(machine.browsers[browser])}</div>;
        })}
        <div>System Info
          <div>
            free space: {machine.system.space.free} of {machine.system.space.total}&nbsp;
            ({machine.system.space.usedPercentage})
          </div>
          <div onClick={this.handleShowOutdatedPackages}>{machine.system.outdatedPackages.length} packages have updates</div>
          {this.state.showOutdatedPackages && <div>{JSON.stringify(machine.system.outdatedPackages)}</div>}
          <span>last refreshed</span><button>refresh</button>
        </div>
      </div>
    );
  }
}

MachineDetailsPage.propTypes = propTypes;

export default MachineDetailsPage;
