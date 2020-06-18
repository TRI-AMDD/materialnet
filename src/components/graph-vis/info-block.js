import React from 'react';
import { format as d3Format } from 'd3-format';
import { Typography } from '@material-ui/core';

function defaultFormatter(v) {
  if (v == null) {
    return v;
  }
  if (typeof v === 'number') {
    return v.toFixed(3);
  }
  return v;
}

export default class InfoBlock extends React.Component {
  render() {
    const { label, value, format, children } = this.props;

    const formatValue =
      typeof format === 'function'
        ? format
        : format
        ? d3Format(format)
        : defaultFormatter;

    return (
      value != null && (
        <>
          <Typography gutterBottom variant="caption" color="textSecondary">
            {label}
          </Typography>
          <Typography paragraph>
            {formatValue(value)}
            {children}
          </Typography>
        </>
      )
    );
  }
}
