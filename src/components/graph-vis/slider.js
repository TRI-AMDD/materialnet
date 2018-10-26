import React from 'react';
import { Slider } from '@material-ui/lab';

const MySlider = (props) => {
  const {
    onChange,
    params,
    digits
  } = props;

  return (
    <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
      <div>
        {params.value.toFixed(Number.isInteger(digits) ? digits : 3)}
      </div>
      <div style={{flexGrow: 1, paddingRight: 16}}>
        <Slider
          value={params.value}
          min={params.min}
          max={params.max}
          onChange={(e, val) => {onChange(val);}}
        />
      </div>
    </div>
  );
}

export default MySlider;