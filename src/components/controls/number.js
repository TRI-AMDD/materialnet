import React, { Component } from 'react';

import { FormControl, TextField } from '@material-ui/core';

export default class NumberControlComponent extends Component {
  onChange = (value) => {
    if (Number.isFinite(Number.parseFloat(value))) {
      const { onChange } = this.props;
      onChange(value);
    }
  };

  render() {
    const { label, value, min, max, step } = this.props;

    return (
      <FormControl fullWidth>
        <TextField
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => {
            this.onChange(e.target.value);
          }}
        />
      </FormControl>
    );
  }
}
