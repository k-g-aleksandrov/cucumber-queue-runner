import React, { Component } from 'react';
import { Carousel } from 'react-responsive-carousel';

import './DashboardPage.css';

import CoveragePage from './Coverage/CoveragePage';

const propTypes = {
};

class DashboardPage extends Component {

  constructor(props) {
    super(props);
  }
// interval={5000} infiniteLoop autoPlay
  render() {
    return (
      <Carousel showThumbs={false} showStatus={false}>
        <CoveragePage />
        <div><div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>Test 2</div></div>
        <div><div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>Test 3</div></div>
      </Carousel>
    );
  }
}

DashboardPage.propTypes = propTypes;

export default DashboardPage;
