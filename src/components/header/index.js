import React, { Component } from 'react';

import { AppBar, Toolbar, Button } from '@material-ui/core';

import logo from './logo.svg';

class Header extends Component {
  render() {
    return (
      <AppBar color="default" position="static">
        <Toolbar>
          <Button color="inherit" aria-label="Logo" style={{marginRight: 9}}>
            <img className='logo' src={logo} alt="logo" />
          </Button>
          <div style={{flex: 1}}>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header;
