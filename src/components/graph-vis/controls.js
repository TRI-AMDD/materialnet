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
import Store, {ApplicationStore} from '../../store';

class Controls extends React.Component {
  static contextType = Store;
  
  render() {
    const store = this.context;
    return (
      <Grid>
        <SelectControl
          value={store.dataset}
          {...ApplicationStore.datasetSettings}
          label={'Dataset'}
          onChange={(val) => { store.dataset = val; }}
        />
        <SelectControl
          value={store.template}
          {...ApplicationStore.templateSettings}
          label={'Template'}
          onChange={(val) => { store.template = val; }}
        />
        <SliderControl
          value={store.zoom}
          {...ApplicationStore.zoomSettings}
          label={'Zoom'}
          onChange={(val) => { store.zoom = val; }}
        />
        <SliderControl
          value={store.opacity}
          {...ApplicationStore.opacitySettings}
          label={'Link opacity / display'}
          disabled={!store.showLinks}
          onChange={(val) => { store.opacity = val; }}
        >
          <Checkbox checked={store.showLinks} onChange={(_e, val) => { store.showLinks = val; }} />
        </SliderControl>
        <SliderControl
          value={store.spacing}
          {...ApplicationStore.spacingSettings}
          label={'Node spacing'}
          onChange={(val) => { store.spacing = val; }}
        />
        <SliderControl
          value={store.year}
          {...ApplicationStore.yearSettings}
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
          {...ApplicationStore.sizeSettings}
          label={'Node size'}
          onChange={(val) => { store.size = val; }}
        />
        <SelectControl
          value={store.color}
          {...ApplicationStore.colorSettings}
          label={'Node color'}
          onChange={(val) => { store.color = val; }}
        />
        <SliderControl
          value={store.colorYear}
          {...ApplicationStore.colorYearSettings}
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
