import React, { Component } from 'react';

import { AppBar, Toolbar, Button, Typography } from '@material-ui/core';

import logo from './logo.svg';

class Header extends Component {
  render() {
    return (
      <AppBar color="default" position="static">
        <Toolbar>
          <Button color="inherit" aria-label="Logo" style={{marginRight: 9}}>
            <img className='logo' src={logo} alt="logo" />
          </Button>
          <Typography variant="h5" color="inherit" noWrap>
            MaterialNet
          </Typography>
          <div style={{flex: 1}}>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header;
