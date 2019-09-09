import React from 'react';

import { withStyles, Drawer, AppBar, Toolbar, IconButton, Button, Typography, CircularProgress } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';

import Controls from './components/graph-vis/controls';
import InfoPanel from './components/graph-vis/info-panel';
import GraphVisComponent from './components/graph-vis';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import logo from './components/header/logo.svg';
import clsx from 'clsx';
import Store from './store';
import { observer } from 'mobx-react';
import './App.css';
import NodeSizeLegend from './components/graph-vis/node-size-legend';
import NodeColorLegend from './components/graph-vis/node-color-legend';
import Tooltip from './components/graph-vis/tooltip';

// based on https://material-ui.com/components/drawers/
const drawerWidth = 360;

const appStyles = theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    position: 'relative',
    backgroundColor: grey['100'],
    padding: theme.spacing(2),
    paddingTop: 0,
    overflowX: 'hidden'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  content: {
    position: 'relative',
    flexGrow: 1
  },
  legend: {
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'flex-end'
  },
  loaderWrapper: {
    zIndex: 200,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    margin: theme.spacing.unit * 2
  }
})

@observer
class App extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar color="default" position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: store.drawerVisible,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => { store.drawerVisible = true; }}
              edge="start"
              className={clsx(classes.menuButton, store.drawerVisible && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Button color="inherit" aria-label="Logo" style={{ marginRight: 9 }}>
              <img className='logo' src={logo} alt="logo" />
            </Button>
            <Typography variant="h5" color="inherit" noWrap>
              MaterialNet - {store.dataset.label}
              </Typography>
            <div style={{ flex: 1 }}>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant='persistent'
          open={store.drawerVisible}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={() => { store.drawerVisible = false; }}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Controls />
        </Drawer>

        <div className={clsx(classes.contentContainer, {
          [classes.contentShift]: store.drawerVisible,
        })}>
          <div className={classes.drawerHeader} />
          <div className={classes.content}>
            <GraphVisComponent />
            {store.showLegend && <div className={classes.legend}>
              <NodeColorLegend />
              <NodeSizeLegend />
            </div>}
            <InfoPanel />
            <Tooltip />
            {!store.data && <div className={classes.loaderWrapper}><CircularProgress disableShrink className={classes.loader} size={100}/></div>}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(appStyles)(App);
