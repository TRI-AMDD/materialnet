import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import RangeSliderControlComponent from '../controls/rangeslider';
import { Chip, FormControl, Input, InputLabel } from '@material-ui/core';

@observer
class Filters extends React.Component {
  static contextType = Store;

  onKeyPress = (evt) => {
    const target = evt.target;
    const value = target.value.trim();
    const filterElements = this.context.filterElements;
    const key = evt.key;
    if (!(key === ' ' || key === 'Enter')) {
      return;
    }
    if (!value || filterElements.some((d) => d === value)) {
      return;
    }
    filterElements.push(value);
    target.value = '';
  }
  
  render() {
    const store = this.context;
    return (<Grid>
      {store.propertyList.filter((meta) => meta.filterable).map((meta) => <RangeSliderControlComponent
        key={meta.label}
        value={store.filters[meta.property] ? store.filters[meta.property].slice() : meta.domain.slice()}
        range={meta.domain}
        label={meta.label}
        step={meta.step || 0.0001}
        format={meta.format}
        onChange={(val) => {
          if (val.every((d, i) => Math.abs(d - meta.domain[i]) < 0.00001)) {
            // same as domain
            delete store.filters[meta.property];
          } else {
            store.filters[meta.property] = val.slice();
          }
        }}
      />)}
      <FormControl fullWidth>
        <InputLabel>
          Elements
        </InputLabel>
        <Input placeholder="Press Space or Enter to add" inputProps={{ onKeyPress: this.onKeyPress, onBlur: this.onKeyPress, list: 'elementList' }}/>
        <datalist id="elementList">
          {store.knownElements.map((d) => <option key={d} value={d} />)}
        </datalist>
        <div>
          {store.filterElements.map((elem) => <Chip key={elem} label={elem} onDelete={() => { store.filterElements = store.filterElements.filter((d) => d !== elem); }} />)}
        </div>
      </FormControl>
    </Grid>
    );
  }
}

export default Filters;