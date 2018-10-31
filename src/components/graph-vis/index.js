import React, { Component } from 'react';

import {
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@material-ui/core';

import { PlayArrow, Pause } from '@material-ui/icons';

import ResizeObserver from 'resize-observer-polyfill';

import { fetchStructure } from '../../rest';

import MySlider from './slider';
import Search from './search';
import InfoPanel from './info-panel';

import { sortStringsLength } from './sort';

import { SceneManager } from '../../scene-manager';
import { DiskDataProvider } from '../../data-provider';
import { wc } from '../../utils/webcomponents.js';

class GraphVisComponent extends Component {
  visElement;
  scene;
  data;
  dragging = {
    status: false,
    start: {x: 0, y: 0}
  }
  ro;

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
      },
      color: {
        value: 'discovery',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Year of discovery', value: 'discovery'},
          {label: 'Discovered/Hypothetical', value: 'boolean'},
          {label: 'Discovered/Undiscovered', value: 'undiscovered'}
        ]
      },
      colorYear: {
        value: 2016,
        min: 1945,
        max: 2016,
        step: 1
      },
      size: {
        value: 'normal',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Degree', value: 'normal'},
          {label: 'Degree - Large', value: 'large'},
          {label: 'Degree - Huge', value: 'huge'}
        ]
      },
      showLinks: {
        value: false
      },
      nightMode: {
        value: false
      },
      selected: {
        value: null
      },
      structure: {
        value: null
      }
    }

    this.sceneSetters = {
      zoom: (val) => { this.scene.zoom = 0.125 * Math.pow(1.06, val); },
      spacing: (val) => { this.scene.expand(val); },
      year: (val) => {
        this.scene.hideAfter(val);
        if (this.state.size.value !== 'none') {
          this.scene.setDegreeSize(this.state.year.value, this.state.size.value);
        }
      },
      opacity: (val) => { this.scene.setLinkOpacity(val); },
      search: (val) => {
        const obj = this.scene.pickName(val);
        if (obj) {
          this.scene.display(val, true);
          this.selectNode(obj);
        } else {
          this.scene.undisplay();
          this.onValueChanged(null, 'selected');
          this.onValueChanged(null, 'structure');
        }
      },
      showLinks: (val) => { this.scene.linksVisible(val); },
      nightMode: (val) => { this.scene.setNightMode(val); },
      size: (val) => { this.scene.setDegreeSize(this.state.year.value, val); },
      color: (val) => {
        switch (val) {
          case 'boolean':
            this.scene.setBooleanColor();
            break;

          case 'discovery':
            this.scene.setDiscoveryColor();
            break;

          case 'undiscovered':
            this.scene.setUndiscoveredColor(this.state.colorYear.value);
            break;
        }
      },
      colorYear: (val) => {
        switch (this.state.color.value) {
          case 'boolean':
            this.scene.setBooleanColor();
            break;

          case 'discovery':
            this.scene.setDiscoveryColor();
            break;

          case 'undiscovered':
            this.scene.setUndiscoveredColor(val);
            break;
        }
      }
    }
  }

  componentDidMount() {
    const { edges, nodes } = this.props;
    this.data = new DiskDataProvider(nodes, edges);
    this.searchOptions = this.data.nodeNames().slice().sort(sortStringsLength).map(val=>({label: val}));
    this.scene = new SceneManager({
      el: this.visElement,
      dp: this.data
    });

    this.setDefaults();

    const animate = (e) => {
      this.scene.render();
      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    this.ro = new ResizeObserver(() => {
      this.scene.resize();
    });

    this.ro.observe(this.visElement);
  }

  componentWillUnmount() {
    if (this.ro) {
      this.ro.unobserve(this.visElement);
    }
  }

  setDefaults() {
    for (let key in this.state) {
      const value = this.state[key].value;
      this.onValueChanged(value, key);
    }
  }

  onValueChanged = (value, key) => {
    if (key in this.state) {
      this.setState((state, props) => {
        state[key]['value'] = value;
        return state;
      });
    }
    if (key in this.sceneSetters) {
      this.sceneSetters[key](value);
    }
  }

  onVisZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    this.onValueChanged(this.state.zoom.value + delta, 'zoom');
  }

  onVisClick = (e) => {
    if (this.dragging.status) {
      return;
    }

    let obj = this.scene.pick({x: e.clientX, y: e.clientY});

    if (!obj) {
      return;
    }

    this.selectNode(obj);
  }

  selectNode (obj) {
    const currentName = this.state.selected.value ? this.state.selected.value.name : '';
    if (obj.name === currentName) {
      this.scene.undisplay();
      obj = null;
    } else {
      this.scene.display(obj.name);
    }

    this.onValueChanged(obj, 'selected');
    this.onValueChanged(null, 'structure');

    if (!obj) {
      return;
    }

    fetchStructure(obj.name)
    .then(cjson => {
      this.onValueChanged(cjson, 'structure');
    })
  }

  onVisDrag = (event) => {
    event.preventDefault();
    this.dragging.status = true;
    this.dragging.start = {x: event.clientX, y: event.clientY};

    const linksOn = this.state.showLinks.value;
    if (linksOn) {
      this.scene.linksVisible(false);
    }

    const mouseMoveListener = (e) => {
      this.onDrag(e);
    };

    const mouseUpListener = () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);

      if (linksOn) {
        this.scene.linksVisible(true);
      }

      setTimeout(() => {this.dragging.status = false;}, 50);
    };

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
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

    this.setState((state, props) => {
      state['year']['play'] = play;
      state['year']['interval'] = interval;
      return state;
    });
  }

  onDrag = (e) => {
    if (!this.dragging.status) {
      return;
    }
    const dx = e.clientX - this.dragging.start.x;
    const dy = e.clientY - this.dragging.start.y;
    this.scene.moveCamera(dx, dy);
    this.dragging.start = {x: e.clientX, y: e.clientY};
  }

  onClearSelection = () => {
    this.scene.undisplay();
    this.onValueChanged(null, 'selected');
    this.onValueChanged(null, 'structure');
  }

  render() {
    const {
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
      selected,
      structure
    } = this.state;

    const nSplit = 2;
    const splitSizes = '0.6, 0.4';

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zoom</TableCell>
              <TableCell>Link opacity / display</TableCell>
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
                    disabled={!showLinks.value}
                    params={opacity}
                    onChange={(val) => {this.onValueChanged(val, 'opacity')}}
                  >
                    <Checkbox checked={showLinks.value} onChange={(e, val) => {this.onValueChanged(val, 'showLinks')}}/>
                  </MySlider>
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
              <TableCell>Node size</TableCell>
              <TableCell>Node color</TableCell>
              <TableCell>Color year</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <Search options={this.searchOptions} value={search.value} maxItems={20} onChange={(e, val) => {this.onValueChanged(val.newValue, 'search')}}/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select value={size.value} onChange={(e) => {this.onValueChanged(e.target.value, 'size')}}>
                    {size.options.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select value={color.value} onChange={(e) => {this.onValueChanged(e.target.value, 'color')}}>
                    {color.options.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <MySlider
                    params={colorYear}
                    onChange={(val) => {this.onValueChanged(val, 'colorYear')}}
                    disabled={color.value !== 'undiscovered'}
                    digits={0}
                  />
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Night Mode <Checkbox checked={nightMode.value} onChange={(e, val) => {this.onValueChanged(val, 'nightMode')}}/></TableCell>
            </TableRow>
          </TableHead>
        </Table>
        <Paper
          style={{width: '100%', height: '40rem', marginTop: '2rem', marginBottom: '2rem'}}
        >
          <split-me
            n={nSplit} sizes={splitSizes}
            ref={wc(
              // Events
              {
                // Ugly workaround to fix firefox not resizing split elements.
                slotResized: () => { this.onValueChanged(zoom.value, 'zoom'); }
              },
            )}
          >
            <div
              slot={0}
              style={{width: '100%', height: '100%'}}
              ref={ref => {this.visElement = ref}}
              draggable={true}
              onDragStart={this.onVisDrag}
              onWheel={this.onVisZoom}
              onClick={this.onVisClick}
            />
            <oc-molecule
              slot={1}
              ref={wc(
                // Events
                {},
                // Props
                {
                  cjson: structure.value
                }
              )}
            />
          </split-me>
        </Paper>
        {selected.value &&
          <InfoPanel {...selected.value} onClear={this.onClearSelection}/>
        }
      </div>
    );
  }
}

export default GraphVisComponent;
