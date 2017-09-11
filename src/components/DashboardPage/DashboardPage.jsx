import React, { Component } from 'react';

import { Carousel } from 'react-responsive-carousel';

const propTypes = {
};

class DashboardPage extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Carousel showArrows>
        <div><img src='http://lemur.duke.edu/wordpress/wp-content/themes/dukelemur2013/images/about-img.jpg'/><p className='legend'>Slide 1</p></div>
        <div><img src='http://lemur.duke.edu/wordpress/wp-content/themes/dukelemur2013/images/about-img.jpg'/><p className='legend'>Slide 2</p></div>
      </Carousel>
    );
  }
}

DashboardPage.propTypes = propTypes;

export default DashboardPage;
