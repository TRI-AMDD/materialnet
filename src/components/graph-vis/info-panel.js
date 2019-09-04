import React from 'react';
import Store from '../../store';
import * as templates from '../../templates';
import { withStyles, Paper,IconButton } from '@material-ui/core';
import Structure from './structure';
import { grey } from '@material-ui/core/colors';
import { observer } from 'mobx-react';
import CloseIcon from '@material-ui/icons/Close';


const visStyles = theme => ({
  root: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: '1rem',
    minWidth: '15rem',
    zIndex: 9999,
    background: grey[100]
  }
})

@observer
class InfoPanel extends React.Component {
  static contextType = Store;

  onClear = () => this.context.clearSelection();

  render() {
    const store = this.context;
    const { classes } = this.props;
    const template = templates[store.template];

    if (!store.selected) {
      return null;
    }
    return <Paper className={classes.root}>
      <IconButton style={{ float: 'right' }} onClick={this.onClear}><CloseIcon /></IconButton>

      {template(store.selected)}
      <div style={{ width: '100%', height: '15rem' }}>
        <Structure cjson={store.structure} />
      </div>
    </Paper>;
  }
}

export default withStyles(visStyles)(InfoPanel);