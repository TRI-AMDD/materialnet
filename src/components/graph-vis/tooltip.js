import React from 'react';
import Store from '../../store';
import { withStyles, Popper } from '@material-ui/core';
import { observer } from 'mobx-react';


const visStyles = theme => ({
  root: {
    background: `rgba(255, 255, 255, 0.75)`,
    borderRadius: 3,
    border: `1px solid rgba(0, 0, 0, 0.75)`,
    color: 'black',
    padding: '0.25rem',
    pointerEvents: ['none', '!important'],

    // based on https://popper.js.org/index.html
    '&[x-placement^= "top"]': {
      marginBottom: 5,
      '& $arrow': {
        borderWidth: '5px 5px 0 5px',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomcolor: 'transparent',
        bottom: -5,
        left: `calc(50% - 5px)`,
        marginTop: 0,
        marginBottom: 0
      }
    },
    '&[x-placement^= "bottom"]': {
      marginTop: 5,
      '& $arrow': {
        borderWidth: '0 5px 5px 5px',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopcolor: 'transparent',
        top: -5,
        left: `calc(50% - 5px)`,
        marginTop: 0,
        marginBottom: 0
      }
    },
    '&[x-placement^= "right"]': {
      marginLeft: 5,
      '& $arrow': {
        borderWidth: '5px 5px 5px 0',
        borderLeftColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomcolor: 'transparent',
        left: -5,
        top: `calc(50% - 5px)`,
        marginLeft: 0,
        marginRight: 0
      }
    },
    '&[x-placement^= "left"]': {
      marginRight: 5,
      '& $arrow': {
        borderWidth: '5px 0 5px 5px',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomcolor: 'transparent',
        right: -5,
        top: `calc(50% - 5px)`,
        marginLeft: 0,
        marginRight: 0
      }
    },
  },
  arrow: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    position: 'absolute',
    margin: 5,
    borderColor: 'black',
  }
});


@observer
class Tooltip extends React.Component {
  static contextType = Store;

  render() {
    const store = this.context;
    const { classes } = this.props;

    const hovered = store.hovered;
    
    const open = hovered.node != null;

    // instead of a DOM fake the needed structure
    // see https://popper.js.org/popper-documentation.html#referenceObject
    const anchorFake = open ? {
      clientWidth: hovered.radius * 2,
      clientHeight: hovered.radius * 2,
      getBoundingClientRect: () => new DOMRect(hovered.position.x - hovered.radius, hovered.position.y - hovered.radius, hovered.radius * 2, hovered.radius * 2)
    } : null;

    return <Popper open={open} placement="top" anchorEl={anchorFake} className={classes.root} disablePortal>
      {hovered.node && store.template.tooltip(hovered.node, store)}
      <div x-arrow="x" className={classes.arrow}/>
    </Popper>;
  }
}

export default withStyles(visStyles)(Tooltip);