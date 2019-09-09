import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import RangeSliderControlComponent from '../controls/rangeslider';

@observer
class Filters extends React.Component {
  static contextType = Store;
  
  render() {
    const store = this.context;
    console.log('render');
    return (<Grid>
      {store.propertyList.filter((meta) => meta.filterAble).map((meta) => <RangeSliderControlComponent
        key={meta.label}
        value={store.filters[meta.property] ? store.filters[meta.property].slice() : meta.domain.slice()}
        range={meta.domain}
        label={meta.label}
        step={meta.step || 0.0001}
        format={meta.format}
        onChange={(val) => {
          store.filters[meta.property] = val.every((d, i) => Math.abs(d - meta.domain[i]) < 0.00001) ? null : val.slice()
        }}
      />)}
    </Grid>
    );
  }
}

export default Filters;