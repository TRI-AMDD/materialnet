import React, { Component } from 'react';

import { withStyles, Drawer } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';

import GraphVis from './containers/graph-vis';
import Header from './components/header';
import './App.css';

const appStyles = _theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  drawerPaper: {
    position: 'relative',
    width: 240,
    backgroundColor: '#37474F',
  },
  body: {
    display: 'flex',
    flexGrow: 1
  },
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow:1
  },
  footer: {
  }
})

class App extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <CssBaseline />
        <Header />
        <div className={classes.body}>
          <Drawer
            variant='persistent'
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
          </Drawer>

          <div className={classes.contentContainer}>
            <div className={classes.content}>
              <GraphVis></GraphVis>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(appStyles)(App);
