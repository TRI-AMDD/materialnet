import React, {Component} from 'react';
import {
  FormControl,
  Typography
} from '@material-ui/core';
import { Slider} from '@material-ui/lab';

class DoubleSliderControlComponent extends Component {

  onValueChange(newValue, index) {
    const { value, onChange } = this.props;
    const otherIndex = (index + 1) % 2;
    if (index === 0) {
      if (newValue >= value[otherIndex]) {
        return;
      }
    } else {
      if (newValue <= value[otherIndex]) {
        return;
      }
    }
    const range = [...value];
    range[index] = newValue;
    onChange(range);
  }

  render() {
    const {
      label,
      value,
      step,
      range
    } = this.props;

    return (
      <FormControl fullWidth>
        <Typography variant='caption'>
          {label}
        </Typography>
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <div>
            {value[0].toFixed(3)}
          </div>
          <div style={{flexGrow: 1, paddingRight: 8, paddingLeft: 8}}>
            <Slider
              min={range[0]} max={range[1]} step={step}
              value={value[0]}
              onChange={(e, val) => {this.onValueChange(val, 0)}}
            />
            <Slider
              style={{marginTop: '-2rem'}}
              min={range[0]} max={range[1]} step={step}
              value={value[1]}
              onChange={(e, val) => {this.onValueChange(val, 1)}}
            />
          </div>
          <div>
            {value[1].toFixed(3)}
          </div>
        </div>
      </FormControl>
    );
  }
}

export default DoubleSliderControlComponent;
