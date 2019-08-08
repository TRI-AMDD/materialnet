import React, { Component } from 'react';

import {
  Checkbox,
  IconButton,
  Paper
} from '@material-ui/core';

import { PlayArrow, Pause } from '@material-ui/icons';

import ResizeObserver from 'resize-observer-polyfill';

import { fetchStructure } from '../../rest';

import InfoPanel from './info-panel';

import { sortStringsLength } from './sort';

import { SceneManager } from '../../scene-manager';
import { GeoJSSceneManager } from '../../geojs-scene-manager';
import { DiskDataProvider } from '../../data-provider';
import Grid from '../controls/grid';
import SearchControl from '../controls/search';
import SliderControl from '../controls/slider';
import SelectControl from '../controls/select';
import { wc } from '../../utils/webcomponents.js';

import * as templates from '../../templates';
import CheckboxControl from '../controls/checkbox';

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

    this.sceneSetters = {
      zoom: (val) => { this.scene.zoom = val; },
      spacing: (val) => { this.scene.expand(val); },
      year: (val) => {
        this.scene.hideAfter(val);
        if (this.props.size.value !== 'none') {
          this.scene.setDegreeSize(this.props.year.value, this.props.size.value);
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
      size: (val) => { this.scene.setDegreeSize(this.props.year.value, val); },
      color: (val) => {
        switch (val) {
          case 'none':
            this.scene.setConstColor();
            break;

          case 'boolean':
            this.scene.setBooleanColor();
            break;

          case 'discovery':
            this.scene.setDiscoveryColor();
            break;

          case 'undiscovered':
            this.scene.setUndiscoveredColor(this.props.colorYear.value);
            break;

          default:
            this.scene.setPropertyColor(val);
        }
      },
      colorYear: (val) => {
        switch (this.props.color.value) {
          case 'boolean':
            this.scene.setBooleanColor();
            break;

          case 'discovery':
            this.scene.setDiscoveryColor();
            break;

          case 'undiscovered':
            this.scene.setUndiscoveredColor(val);
            break;

          case 'none':
            this.scene.setConstColor();
            break;

          default:
            throw new Error(`impossible colormap option: ${val}`);
        }
      }
    }
  }

  componentDidMount() {
    const { edges, nodes } = this.props;
    this.data = new DiskDataProvider(nodes, edges);
    this.searchOptions = this.data.nodeNames().slice().sort(sortStringsLength).map(val=>({label: val}));
    this.scene = new GeoJSSceneManager({
      el: this.visElement,
      dp: this.data,
      onValueChanged: this.onValueChanged,
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
    for (let key in this.props) {
      const value = this.props[key].value;
      if (key !== 'colorYear' || ['discovery', 'boolean', 'undiscovered'].indexOf(value) !== -1) {
        this.onValueChanged(value, key);
      }
    }
  }

  onValueChanged = (value, key) => {
    if (key in this.props) {
      if (this.props.update) {
        this.props.update(value, key);
      }
    }
    if (key in this.sceneSetters) {
      this.sceneSetters[key](value);
    }
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
    const currentName = this.props.selected.value ? this.props.selected.value.name : '';
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

    const linksOn = this.props.showLinks.value;
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
    const {year} = this.props;
    let interval = year.interval;
    let play = !year.play;

    if (year.play && year.interval) {
      clearInterval(year.interval);
      interval = null;
    }

    if (!year.play) {
      interval = setInterval(() => {
        const {year} = this.props;
        let nextYear = year.value + 1;
        if (year.value === year.max) {
          nextYear = year.min;
        }
        this.onValueChanged(nextYear, 'year');
      }, 1000);
    }

    this.props.setPlayState(play, interval);
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
      selected,
      structure,
      nodes,
      edges
    } = this.props;

    const dataChanged = this.datasetName !== this.props.dataset.value;
    if (dataChanged) {
      console.log('DATA CHANGED');
      if (this.scene) {
        this.scene.clear();

        this.data = new DiskDataProvider(nodes, edges);

        this.scene.initScene(this.data);
        this.setDefaults();
      }
    }
    this.datasetName = this.props.dataset.value;

    const nSplit = 2;
    const splitSizes = '0.6, 0.4';

    return (
      <div>
        <Grid>
          <SelectControl
            {...dataset}
            label={'Dataset'}
            onChange={(val) => {this.onValueChanged(val, 'dataset')}}
          />
          <SelectControl
            {...template}
            label={'Template'}
            onChange={(val) => {this.onValueChanged(val, 'template')}}
          />
          <SliderControl
            {...zoom}
            label={'Zoom'}
            range={[zoom.min, zoom.max]}
            onChange={(val) => {this.onValueChanged(val, 'zoom')}}
          />
          <SliderControl
            {...opacity}
            label={'Link opacity / display'}
            disabled={!showLinks.value}
            range={[opacity.min, opacity.max]}
            onChange={(val) => {this.onValueChanged(val, 'opacity')}}
          >
            <Checkbox checked={showLinks.value} onChange={(_e, val) => {this.onValueChanged(val, 'showLinks')}}/>
          </SliderControl>
          <SliderControl
            {...spacing}
            label={'Node spacing'}
            range={[spacing.min, spacing.max]}
            onChange={(val) => {this.onValueChanged(val, 'spacing')}}
          />
          <SliderControl
            {...year}
            label={'Discovered before'}
            range={[year.min, year.max]}
            digits={0}
            onChange={(val) => {this.onValueChanged(val, 'year')}}
          >
            <IconButton
              onClick={this.toggleAutoplay}
            >
              { year.play ? <Pause/> : <PlayArrow/>}
            </IconButton>
          </SliderControl>
          <SearchControl
            label={'Search'}
            options={this.searchOptions}
            value={search.value}
            maxItems={20}
            onChange={(_e, val) => {this.onValueChanged(val.newValue, 'search')}}
          />
          <SelectControl
            {...size}
            label={'Node size'}
            onChange={(val) => {this.onValueChanged(val, 'size')}}
          />
          <SelectControl
            {...color}
            label={'Node color'}
            onChange={(val) => {this.onValueChanged(val, 'color')}}
          />
          <SliderControl
            {...colorYear}
            label={'Color year'}
            range={[colorYear.min, colorYear.max]}
            digits={0}
            disabled={color.value !== 'undiscovered'}
            onChange={(val) => {this.onValueChanged(val, 'colorYear')}}
          />
          <CheckboxControl
            label="Night mode"
            value={nightMode.value}
            onChange={(val) => {this.onValueChanged(val, 'nightMode')}}
          />
        </Grid>

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
          <InfoPanel {...selected.value} onClear={this.onClearSelection} template={templates[this.props.template.value]} />
        }
      </div>
    );
  }
}

export default GraphVisComponent;
