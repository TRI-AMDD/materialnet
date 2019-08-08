import React from 'react';
import {
  Grid
} from '@material-ui/core';

export default (props) => {
  let {
    children
  } = props;

  children = React.Children.toArray(children);

  return (
    <Grid container spacing={24}>
      {children.map((child, i) => {
        const gridsize = child.props.gridsize || {xs: 12, sm: 6}
        return (
          <Grid item key={i} {...gridsize}>
            {child}
          </Grid>
        );
      })}
    </Grid>
  );
}
