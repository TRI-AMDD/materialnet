import React from 'react';

import Grid from '../controls/grid';
import Store from '../../store';
import { observer } from 'mobx-react';
import ReactSelectWrapper from '../controls/reactselect';
import RangeSliderControlComponent from '../controls/rangeslider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';
import { DiscoveryYearHelp, ElementsHelp } from './helpPanel';

@observer
class Filters extends React.Component {
  static contextType = Store;


  render() {
    const store = this.context;
    return (<Grid>
      { /* dataset specific */}
      {store.yearRange && <RangeSliderControlComponent
        value={store.year}
        range={store.yearRange}
        step={1}
        label='Discovery Year'
        digits={0}
        onChange={(val) => { store.year = val.slice(); }}
      >
        <IconButton
          onClick={() => store.toggleAutoplay()}
        >
          {store.play ? <Pause /> : <PlayArrow />}
        </IconButton>
      </RangeSliderControlComponent>}
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
        label={<ElementsHelp />}
        value={store.defineSubspaceNodes.map((value) => ({ label: value.name, value: value.name, icon: <FontAwesomeIcon icon={faFlask} />}))}
        isMulti
        options={store.knownElements.map((value) => ({ label: value, value }))}
        onChange={(values) => {
          store.setDefineSubspaceNodes(values.map((d) => d.value));
        }}
      />
    </Grid>
    );
  }
}

export default Filters;
