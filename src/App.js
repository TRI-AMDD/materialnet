import React from 'react';

import { withStyles, Drawer } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';

import Header from './components/header';
import Store, { ApplicationStore } from './store';
import './App.css';
import Controls from './components/graph-vis/controls';
import InfoPanel from './components/graph-vis/info-panel';
import GraphVisComponent from './components/graph-vis';
import NodeSizeLegend from './components/graph-vis/node-size-legend';
import NodeColorLegend from './components/graph-vis/node-color-legend';

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
    position: 'relative',
    flexDirection: 'column'
  },
  content: {
    flexGrow:1,
    height: '100%'
  },
  legend: {
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'flex-end'
  },
  footer: {
  },
  chris: {
    height: '100%'
  }
})

const store = new ApplicationStore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.drawerRef = React.createRef();
  }
  render() {
    const { classes } = this.props;

    return (
      <Store.Provider value={store}>
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
              <div style={{ width: '100%' }}>
                <Controls/>
              </div>
            </Drawer>

            <div className={classes.contentContainer}>
              <div className={classes.content}>
                <GraphVisComponent/>
              </div>
              <div className={classes.legend}>
                <NodeSizeLegend />
                <NodeColorLegend />
              </div>
              <InfoPanel />
            </div>
          </div>
        </div>
      </Store.Provider>
    );
  }
}

export default withStyles(appStyles)(App);
