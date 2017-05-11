import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from 'react-bootstrap/lib/Grid';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import LinkContainer from 'react-router-bootstrap/lib/LinkContainer';

import './bootstrap.css';
import './App.css';

const propTypes = {
  children: PropTypes.node
};

class App extends Component {
  render() {
    return (
      <div style={{ padding: 0 }}>
        <Navbar inverse fluid>
          <Navbar.Header>
            <Navbar.Toggle/>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav navbar>
              <LinkContainer to='/sessions'>
                <NavItem>Sessions</NavItem>
              </LinkContainer>
              <LinkContainer to='/projects'>
                <NavItem>Projects</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid fluid>
          {this.props.children}
        </Grid>
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
