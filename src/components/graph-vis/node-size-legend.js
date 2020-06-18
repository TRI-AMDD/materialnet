import React from 'react';
import Store from '../../store';
import { observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';

const styles = (theme) => ({
  root: {},
});

@observer
class NodeSizeLegend extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;

    return store.nodeSizer.legend(store.zoomNodeSizeFactor);
  }
}

export default withStyles(styles)(NodeSizeLegend);
