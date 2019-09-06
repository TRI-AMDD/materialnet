import React from 'react';
import Store from '../../store';
import { withStyles, Paper, IconButton } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { observer } from 'mobx-react';
import CloseIcon from '@material-ui/icons/Close';


const visStyles = theme => ({
  root: {
    position: 'absolute',
    right: 0,
    top: 0,
    overflow: 'auto',
    maxHeight: '100%',
    padding: '1rem',
    minWidth: '15rem',
    zIndex: 9999,
    background: grey[100]
  }
});



@observer
class InfoPanel extends React.Component {
  static contextType = Store;

  onClear = () => this.context.selected = null;

  render() {
    const store = this.context;
    const { classes } = this.props;
    const node = store.selected;

    if (!node) {
      return null;
    }
    return <Paper className={classes.root}>
      <IconButton style={{ float: 'right' }} onClick={this.onClear}><CloseIcon /></IconButton>

      {store.template && store.template.render(node, store)}
    </Paper>;
  }
}

export default withStyles(visStyles)(InfoPanel);