import React, {Component} from 'react';
import {
  FormControl,
  Typography
} from '@material-ui/core';
import { Slider} from '@material-ui/lab';

class SliderControlComponent extends Component {

  render() {
    const {
      label,
      value,
      range,
      step,
      onChange,
      digits,
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
            {value.toFixed(Number.isInteger(digits) ? digits : 2)}
          </div>
          <div style={{flexGrow: 1, paddingLeft: 16, paddingRight}}>
            <Slider
              {...this.props}
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
