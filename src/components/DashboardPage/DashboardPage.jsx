import React, { Component } from 'react';

import { Carousel } from 'react-responsive-carousel';

import './DashboardPage.css';

const propTypes = {
};

class DashboardPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Carousel
        autoPlay interval={5000} infiniteLoop
        showThumbs={false} showStatus={false}
      >
        <div><div style={{ width: '100vw', height: '100vh', backgroundColor: 'red' }}>Test 1</div></div>
        <div><div style={{ width: '100vw', height: '100vh', backgroundColor: 'green' }}>Test 2</div></div>
        <div><div style={{ width: '100vw', height: '100vh', backgroundColor: 'blue' }}>Test 3</div></div>
      </Carousel>
    );
  }
}

DashboardPage.propTypes = propTypes;

export default DashboardPage;
