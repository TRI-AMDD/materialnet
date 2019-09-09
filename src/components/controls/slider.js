import React, {Component} from 'react';
import {
  FormControl,
  Typography,
  Slider
} from '@material-ui/core';

class SliderControlComponent extends Component {

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

    const paddingRight = child ? 16 : 0;

    return (
      <FormControl fullWidth>
        <Typography variant='caption'>
          {label}
        </Typography>
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <div>
            {format ? format(value) : value.toFixed(Number.isInteger(digits) ? digits : 2)}
          </div>
          <div style={{flexGrow: 1, paddingLeft: 16, paddingRight}}>
            <Slider
              min={range[0]} max={range[1]} step={step}
              value={value}
              onChange={(_e, val) => { onChange(val); }}
            />
          </div>
          {child}
        </div>
      </FormControl>
    );
  }
}

export default SliderControlComponent;
