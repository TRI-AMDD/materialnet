import React from 'react';

import {
  Checkbox,
  IconButton
} from '@material-ui/core';

import { PlayArrow, Pause } from '@material-ui/icons';

import Grid from '../controls/grid';
import SearchControl from '../controls/search';
import SliderControl from '../controls/slider';
import SelectControl from '../controls/select';
import CheckboxControl from '../controls/checkbox';
import Store from '../../store';
import { observer } from 'mobx-react';

@observer
class Controls extends React.Component {
  static contextType = Store;
  
  render() {
    const store = this.context;
    return (
      <Grid>
        <SelectControl
          value={store.dataset.value}
          options={store.datasets}
          label={'Dataset'}
          onChange={(val) => { store.dataset = store.datasets.find((d) => d.value === val); }}
        />
        <SelectControl
          value={store.template.value}
          options={store.templates}
          label={'Template'}
          onChange={(val) => { store.template = store.templates.find((d) => d.value === val); }}
        />
        <SliderControl
          value={store.zoom}
          range={store.zoomRange}
          label={'Zoom'}
          onChange={(val) => { store.zoom = val; }}
        />
        <SliderControl
          value={store.opacity}
          range={[0, 0.1]}
          step={0.001}
          label={'Link opacity / display'}
          disabled={!store.showLinks}
          onChange={(val) => { store.opacity = val; }}
        >
          <Checkbox checked={store.showLinks} onChange={(_e, val) => { store.showLinks = val; }} />
        </SliderControl>
        <SliderControl
          value={store.spacing}
          range={store.spacingRange}
          label={'Node spacing'}
          onChange={(val) => { store.spacing = val; }}
        />
        { /* dataset specific */ }
        <SliderControl 
          value={store.year}
          range={store.yearRange}
          step={1}
          label={'Discovered before'}
          digits={0}
          onChange={(val) => { store.year = val; }}
        >
          <IconButton
            onClick={() => store.toggleAutoplay()}
          >
            {store.play ? <Pause /> : <PlayArrow />}
          </IconButton>
        </SliderControl>
        <SearchControl
          label={'Search'}
          options={store.searchOptions}
          value={store.search}
          maxItems={20}
          onChange={(_e, val) => { store.search = val.newValue; }}
        />
        <SelectControl
          value={store.size}
          options={store.sizes}
          label={'Node size'}
          onChange={(val) => { store.size = val; }}
        />
        <SelectControl
          value={store.color}
          options={store.colors}
          label={'Node color'}
          onChange={(val) => { store.color = val; }}
        />
        { /* dataset specific */}
        <SliderControl
          value={store.colorYear}
          range={store.yearRange}
          step={1}
          label={'Color year'}
          digits={0}
          disabled={store.color !== 'undiscovered'}
          onChange={(val) => { store.colorYear = val; }}
        />
        <CheckboxControl
          label="Night mode"
          value={store.nightMode}
          onChange={(val) => { store.nightMode = val; }}
        />
      </Grid>
    );
  }
}

export default Controls;