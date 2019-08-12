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

const Controls = ({
  dataset,
  template,
  zoom,
  spacing,
  opacity,
  year,
  search,
  size,
  color,
  colorYear,
  showLinks,
  nightMode,
  onValueChanged,
  searchOptions,
  toggleAutoplay
}) => (
  <Grid>
    <SelectControl
      {...dataset}
      label={'Dataset'}
      onChange={(val) => {onValueChanged(val, 'dataset')}}
    />
    <SelectControl
      {...template}
      label={'Template'}
      onChange={(val) => {onValueChanged(val, 'template')}}
    />
    <SliderControl
      {...zoom}
      label={'Zoom'}
      range={[zoom.min, zoom.max]}
      onChange={(val) => {onValueChanged(val, 'zoom')}}
    />
    <SliderControl
      {...opacity}
      label={'Link opacity / display'}
      disabled={!showLinks.value}
      range={[opacity.min, opacity.max]}
      onChange={(val) => {onValueChanged(val, 'opacity')}}
    >
      <Checkbox checked={showLinks.value} onChange={(_e, val) => {onValueChanged(val, 'showLinks')}}/>
    </SliderControl>
    <SliderControl
      {...spacing}
      label={'Node spacing'}
      range={[spacing.min, spacing.max]}
      onChange={(val) => {onValueChanged(val, 'spacing')}}
    />
    <SliderControl
      {...year}
      label={'Discovered before'}
      range={[year.min, year.max]}
      digits={0}
      onChange={(val) => {onValueChanged(val, 'year')}}
    >
      <IconButton
        onClick={toggleAutoplay}
      >
        { year.play ? <Pause/> : <PlayArrow/>}
      </IconButton>
    </SliderControl>
    <SearchControl
      label={'Search'}
      options={searchOptions}
      value={search.value}
      maxItems={20}
      onChange={(_e, val) => {onValueChanged(val.newValue, 'search')}}
    />
    <SelectControl
      {...size}
      label={'Node size'}
      onChange={(val) => {onValueChanged(val, 'size')}}
    />
    <SelectControl
      {...color}
      label={'Node color'}
      onChange={(val) => {onValueChanged(val, 'color')}}
    />
    <SliderControl
      {...colorYear}
      label={'Color year'}
      range={[colorYear.min, colorYear.max]}
      digits={0}
      disabled={color.value !== 'undiscovered'}
      onChange={(val) => {onValueChanged(val, 'colorYear')}}
    />
    <CheckboxControl
      label="Night mode"
      value={nightMode.value}
      onChange={(val) => {onValueChanged(val, 'nightMode')}}
    />
  </Grid>
)

export default Controls;
