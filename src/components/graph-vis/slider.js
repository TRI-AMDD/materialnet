import React from 'react';
import { Slider } from '@material-ui/lab';

const MySlider = (props) => {
  const {
    onChange,
    params,
    digits,
    children
  } = props;

  return (
    <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
      <div>
        {params.value.toFixed(Number.isInteger(digits) ? digits : 3)}
      </div>
      <div style={{flexGrow: 1, paddingRight: 16, paddingLeft: 16}}>
        <Slider
          {...props}
          value={params.value}
          min={params.min}
          max={params.max}
          step={params.step}
          onChange={(e, val) => {onChange(val);}}
        />
      </div>
      {children}
    </div>
  );
}

export default MySlider;