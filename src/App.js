import React from 'react';

import { withStyles, Drawer } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';

import GraphVis from './containers/graph-vis';
import Header from './components/header';
import './App.css';

const appStyles = theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  drawerPaper: {
    position: 'relative',
    backgroundColor: grey['100'],
    width: 360,
    padding: theme.spacing.unit * 2,
    overflowX: 'hidden'
  },
  body: {
    display: 'flex',
    flexGrow:1
  },
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow:1,
    height: '100%'
  },
  footer: {
  },
  chris: {
    height: '100%'
  }
})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.drawerRef = React.createRef();
  }
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
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
            <div style={{width: '100%'}} ref={this.drawerRef}></div>
          </Drawer>

          <div className={classes.contentContainer}>
            <div className={classes.content}>
              <GraphVis drawerRef={this.drawerRef}></GraphVis>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(appStyles)(App);
