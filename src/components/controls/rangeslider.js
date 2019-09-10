import React, {Component} from 'react';
import {
  FormControl,
  Typography,
  Slider
} from '@material-ui/core';

class RangeSliderControlComponent extends Component {

  render() {
    const {
      label,
      value,
      range,
      step,
      onChange,
      digits,
      format,
      children
    } = this.props;

    const child = children ? React.Children.only(children) : undefined;

    return (
      <FormControl fullWidth>
        <Typography variant='caption'>
          {label}
        </Typography>
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <div>
            {format ? format(value[0]) : value[0].toFixed(Number.isInteger(digits) ? digits : 2)}
          </div>
          <div style={{flexGrow: 1, paddingLeft: 16, paddingRight: 16}}>
            <Slider
              min={range[0]} max={range[1]} step={step}
              value={value}
              onChange={(_e, val) => { onChange(val); }}
            />
          </div>
          <div>
            {format ? format(value[1]) : value[1].toFixed(Number.isInteger(digits) ? digits : 2)}
          </div>
          {child}
        </div>
      </FormControl>
    );
  }
}

export default RangeSliderControlComponent;
