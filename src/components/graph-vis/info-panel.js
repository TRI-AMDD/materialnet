import React from 'react';
import Store from '../../store';
import * as templates from '../../templates';
import { Popper, withStyles } from '@material-ui/core';
import Structure from './structure';
import { grey } from '@material-ui/core/colors';


const visStyles = theme => ({
  root: {
    padding: '1rem',
    minWidth: '15rem',
    zIndex: 9999,
    background: grey[100]
  }
})


class InfoPanel extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;
    const { classes } = this.props;
    const template = templates[store.template];

    const templateProps = { ...store.selected, onClear: () => store.clearSelection() };

    return <Popper open={store.selected != null} placement="right-end" className={classes.popover} modifiers={{ inner: { enabled: true } }}>
      {template(templateProps)}
      <div style={{ width: '100%', height: '15rem' }}>
        <Structure cjson={store.structure} />
      </div>
    </Popper>;
  }
}

export default withStyles(visStyles)(InfoPanel);