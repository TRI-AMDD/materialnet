import React from 'react';
import Store from '../../store';
import { withStyles, Paper, IconButton } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Close } from '@material-ui/icons';
import RotatedPin from './RotatedPin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';


const visStyles = theme => ({
  root: {
    position: 'absolute',
    right: 0,
    top: 0,
    overflow: 'auto',
    maxHeight: '100%',
    padding: '1rem',
    minWidth: '15rem',
    zIndex: theme.zIndex.modal
  }
});

@observer
class InfoPanel extends React.Component {
  static contextType = Store;

  onClear = () => this.context.selected = null;

  toggleIncludeNeighbors = () => {
    const store = this.context;
    const node = store.selected;

    if (!node) {
      return;
    }

    store.toggleIncludeNeighbors(node);
  }

  toggleDefineSubspace = () => {
    const store = this.context;
    const node = store.selected;

    if (!node) {
      return;
    }

    store.toggleDefineSubspace(node);
  }

  togglePinned = () => {
    const store = this.context;
    const node = store.selected;

    if (!node) {
      return;
    }

    store.togglePinned(node);
  }

  render() {
    const store = this.context;
    const { classes } = this.props;
    const node = store.selected;

    if (!node) {
      return null;
    }
    return <Paper className={classes.root}>
      <IconButton style={{ float: 'right' }} onClick={this.onClear} title="Clear Selection" size="small"><Close /></IconButton>

      <IconButton style={{ float: 'right' }} onClick={this.toggleDefineSubspace} title={store.isDefineSubspacePinned(node) ? 'Release Subspace Restriction' : 'Restrict Subspace'} size="small" color={store.isDefineSubspacePinned(node) ? 'primary' : 'inherit'}>
        <FontAwesomeIcon icon={faFlask} />
      </IconButton>
      <IconButton style={{ float: 'right' }} onClick={this.toggleIncludeNeighbors} title={store.isIncludeNeighborsPinned(node) ? 'Hide Neighbors' : 'Show Neighbors'} size="small" color={store.isIncludeNeighborsPinned(node) ? 'primary' : 'inherit'}>
        <FontAwesomeIcon icon={faProjectDiagram} />
      </IconButton>
      <IconButton style={{ float: 'right' }} onClick={this.togglePinned} title={store.isPinned(node) ? 'UnPin Selection' : 'Pin Selection'} size="small" color={store.isPinned(node) ? 'primary' : 'inherit'}>
        <RotatedPin />
      </IconButton>

      {store.template && store.template.render(node, store)}
    </Paper>;
  }
}

export default withStyles(visStyles)(InfoPanel);