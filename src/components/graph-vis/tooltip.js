import React from 'react';
import Store from '../../store';
import { withStyles, Popper } from '@material-ui/core';
import { observer } from 'mobx-react';


const visStyles = theme => ({
  root: {
    
  }
});



@observer
class Tooltip extends React.Component {
  static contextType = Store;

  onClear = () => this.context.selected = null;

  render() {
    const store = this.context;
    const { classes } = this.props;
    
    const open = store.hovered.node || store.hoveredLine.node1;

    return <Popper open={open} keepMounted placement="top-end" anchorEl>
      Hello
    </Popper>;
  }
}

export default withStyles(visStyles)(Tooltip);