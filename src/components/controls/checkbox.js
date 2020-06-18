import React, { Component } from 'react';
import { FormControl, FormControlLabel, Checkbox } from '@material-ui/core';

class CheckboxControlComponent extends Component {
  render() {
    const { label, value, onChange, className } = this.props;

    return (
      <FormControl fullWidth className={className}>
        <FormControlLabel
          control={
            <Checkbox
              checked={value}
              onChange={(_e, val) => {
                onChange(val);
              }}
            />
          }
          label={label}
        />
      </FormControl>
    );
  }
}

export default CheckboxControlComponent;
