import React, { Component } from 'react';

import produce from "immer"

import {
  Select,
  MenuItem,
  FormControl,
  Input,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@material-ui/core';

// import { Play, Pause } from '@material-ui/icons';
import { PlayArrow, Pause } from '@material-ui/icons'

import { Slider } from '@material-ui/lab';
import MySlider from './slider';
import Search from './search';

import { sortStringsLength } from './sort';

import { SceneManager } from '../../scene-manager';
import { DiskDataProvider } from '../../data-provider';

class GraphVisComponent extends Component {
  visElement;
  scene;
  data;

  constructor(props) {
    super(props);

    this.state = {
      zoom: {
        value: 40,
        min: 0,
        max: 100
      },
      spacing: {
        value: 1,
        min: 0.1,
        max: 10
      },
      opacity: {
        value: 0.01,
        min: 0,
        max: 0.1,
        step: 0.001
      },
      year: {
        value: 2016,
        min: 1945,
        max: 2016,
        step: 1,
        play: false,
        interval: null
      },
      search: {
        value: ''
      }
    }

    this.sceneSetters = {
      zoom: (val) => { this.scene.zoom = 0.125 * Math.pow(1.06, val); },
      spacing: (val) => { this.scene.expand(val); },
      year: (val) => { this.scene.hideAfter(val); },
      opacity: (val) => { this.scene.setLinkOpacity(val); },
      search: (val) => { this.scene.display(val); }
    }
  }

  componentDidMount() {
    const { edges, nodes } = this.props;
    this.data = new DiskDataProvider(nodes, edges);
    this.searchOptions = this.data.nodeNames().slice().sort(sortStringsLength).map(val=>({label: val}));
    this.scene = new SceneManager({
      el: this.visElement,
      width: 1000,
      height: 400,
      dp: this.data
    });

    this.setDefaults();
    this.scene.linksVisible(false);

    const animate = (e) => {
      this.scene.render();
      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  }

  setDefaults() {
    for (let key in this.state) {
      const value = this.state[key].value;
      this.onValueChanged(value, key);
    }
  }

  onValueChanged = (value, key) => {
    if (key in this.state) {
      const newState = produce(this.state, draft => {
        draft[key]['value'] = value;
        return draft;
      })
      this.setState(newState);
    }
    if (key in this.sceneSetters) {
      this.sceneSetters[key](value);
    }
  }

  onVisZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? -1 : 1;
    this.onValueChanged(this.state.zoom.value + delta, 'zoom');
  }

  toggleAutoplay = () => {
    const {year} = this.state;
    let interval = year.interval;
    let play = !year.play;

    if (year.play && year.interval) {
      clearInterval(year.interval);
      interval = null;
    }

    if (!year.play) {
      interval = setInterval(() => {
        const {year} = this.state;
        let nextYear = year.value + 1;
        if (year.value === year.max) {
          nextYear = year.min;
        }
        this.onValueChanged(nextYear, 'year');
      }, 1000);
    }

    const newState = produce(this.state, draft => {
      draft.year.play = play;
      draft.year.interval = interval;
      return draft;
    });
    this.setState(newState);
  }

  render() {
    const {
      zoom,
      spacing,
      opacity,
      year,
      search
    } = this.state;

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zoom</TableCell>
              <TableCell>Link opacity</TableCell>
              <TableCell>Node spacing</TableCell>
              <TableCell>Discovered before</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <MySlider
                    params={zoom}
                    onChange={(val) => {this.onValueChanged(val, 'zoom')}}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <MySlider
                    params={opacity}
                    onChange={(val) => {this.onValueChanged(val, 'opacity')}}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <MySlider
                    params={spacing}
                    onChange={(val) => {this.onValueChanged(val, 'spacing')}}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <MySlider
                    params={year}
                    onChange={(val) => {this.onValueChanged(val, 'year')}}
                    digits={0}
                  >
                    <IconButton
                      onClick={this.toggleAutoplay}
                    >
                      { year.play ? <Pause/> : <PlayArrow/>}
                    </IconButton>
                  </MySlider>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Search</TableCell>
              <TableCell>Node color</TableCell>
              <TableCell>Node size</TableCell>
              <TableCell>Show links</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <Search options={this.searchOptions} value={search.value} onChange={(e, val) => {this.onValueChanged(val.newValue, 'search')}}/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div
          ref={ref => {this.visElement = ref}}
          onWheel={this.onVisZoom}
        />
      </div>
    );
  }
}

export default GraphVisComponent;
