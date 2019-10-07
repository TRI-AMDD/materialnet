import React from 'react';
import { withStyles } from '@material-ui/styles';
import { Paper } from '@material-ui/core';
import { observer } from 'mobx-react';
import clsx from 'clsx';

// based on https://github.com/phovea/phovea_ui/tree/master/src/layout

const visStyles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  separator: {
    height: 3,
    cursor: 'ns-resize'
  },
  dragging: {
    userSelect: 'none',
    '& > *': {
      opacity: 0.5,
      pointerEvents: 'none'
    }
  }
});

@observer
class SplitContainer extends React.Component {

  state = {
    draggingValue: null
  }

  onMouseDown = (evt) => {
    const { classes } = this.props;
    if (evt.target instanceof HTMLElement && evt.target.classList.contains(classes.separator)) {
      this.enableDragging(evt.currentTarget);
    }
  };

  enableDragging(node) {
    const { classes } = this.props;
    const mouseMove = (evt) => {
      const n = node;
      const bb = n.getBoundingClientRect();
      const y = evt.clientY - bb.top - n.clientTop + n.scrollTop;
      const ratio = Math.round(100 * y / n.offsetHeight);
      this.setState({ draggingValue: ratio });
      //no events
      evt.stopPropagation();
      evt.preventDefault();
    };
    const disable = (evt) => {
      if (evt.target !== evt.currentTarget && evt.type === 'mouseleave') {
        return;
      }
      node.classList.remove(classes.dragging);
      node.removeEventListener('mousemove', mouseMove);
      node.removeEventListener('mouseup', disable);
      node.removeEventListener('mouseleave', disable);
      const value = this.state.draggingValue;
      this.setState({ draggingValue: null });
      if (this.props.value !== value) {
        this.props.onValueChanged(value);
      }
    };

    node.classList.add(classes.dragging);
    node.addEventListener('mousemove', mouseMove);
    node.addEventListener('mouseup', disable);
    node.addEventListener('mouseleave', disable);
  }

  render() {
    const { classes, top, bottom, className } = this.props;
    const value = this.state.draggingValue != null ? this.state.draggingValue : this.props.value;

    if (!top || !bottom) {
      return <div className={clsx(classes.root, className)}>
        {top && top(100)}
        {bottom && bottom(100)}
      </div>;
    }

    return <div className={clsx(classes.root, className)} onMouseDown={this.onMouseDown}>
      {value > 0 && top(value)}
      <Paper className={classes.separator} />
      {value < 100 && bottom(100 - value)}
    </div>;
  }
}

export default withStyles(visStyles)(SplitContainer);
