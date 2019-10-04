import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import ReactSelectWrapper from '../controls/reactselect';
import RangeSliderControlComponent from '../controls/rangeslider';

@observer
class Filters extends React.Component {
  static contextType = Store;

  
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
      <ReactSelectWrapper
        label="Elements"
        value={store.filterElements.map((value) => ({ label: value, value }))}
        isMulti
        options={store.knownElements.map((value) => ({ label: value, value }))}
        onChange={(values) => {
          store.filterElements = values.map((d) => d.value);
        }}
      />
    </Grid>
    );
  }
}

export default Filters;
