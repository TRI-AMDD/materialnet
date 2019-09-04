import React, { Component } from 'react';

import { Portal, withStyles, Popper } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';

import ResizeObserver from 'resize-observer-polyfill';

import { fetchStructure } from '../../rest';

import InfoPanel from './info-panel';

import { sortStringsLength } from './sort';

import { GeoJSSceneManager } from '../../geojs-scene-manager';
import { DiskDataProvider } from '../../data-provider';

import * as templates from '../../templates';

import Controls from './controls';
import Structure from './structure';
import Store from '../../store';


const visStyles = theme => ({
  popover: {
    padding: '1rem',
    minWidth: '15rem',
    zIndex: 9999,
    background: grey[100]
  }
})


class GraphVisComponent extends Component {
  static contextType = Store;

  visElement;
  scene;
  dragging = {
    status: false,
    start: {x: 0, y: 0}
  }
  ro;

  constructor(props, context) {
    super(props, context);

    this.sceneSetters = {
      zoom: (val) => { this.scene.zoom = val; },
      spacing: (val) => { this.scene.expand(val); },
      year: (val) => {
        this.scene.hideAfter(val);
        if (this.context.size !== 'none') {
          this.scene.setDegreeSize(this.context.year, this.context.size);
        }
      },
      opacity: (val) => { this.scene.setLinkOpacity(val); },
      search: (val) => {
        const obj = this.scene.pickName(val);
        if (obj) {
          this.scene.display(val, true);
        } else {
          this.scene.undisplay();
          this.context.deselect();
        }
      },
      showLinks: (val) => { this.scene.linksVisible(val); },
      nightMode: (val) => { this.scene.setNightMode(val); },
      size: (val) => { this.scene.setDegreeSize(this.context.year, val); },
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
            this.scene.setUndiscoveredColor(this.context.colorYear);
            break;

          default:
            this.scene.setPropertyColor(val);
        }
      },
      colorYear: (val) => {
        switch (this.context.color) {
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
    this.scene = new GeoJSSceneManager({
      el: this.visElement,
      dp: this.data,
      onValueChanged: this.onValueChanged,
      picked: (data, position) => {
        this.selectNode(data, position);
      },
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
      if (this.props[key] && this.props[key].value ){
        const value = this.props[key].value;
        if (key !== 'colorYear' || ['discovery', 'boolean', 'undiscovered'].indexOf(value) !== -1) {
          this.onValueChanged(value, key);
        }
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

  onDrag = (e) => {
    if (!this.dragging.status) {
      return;
    }
    const dx = e.clientX - this.dragging.start.x;
    const dy = e.clientY - this.dragging.start.y;
    this.scene.moveCamera(dx, dy);
    this.dragging.start = {x: e.clientX, y: e.clientY};
  }

  render() {
    const {
      nodes,
      edges,
    } = this.props;

    const dataChanged = this.datasetName !== this.props.dataset.value;
    if (dataChanged) {
      console.log('DATA CHANGED');
      if (this.scene) {
        this.scene.clear();
        this.scene.initScene(this.data);
        this.setDefaults();
      }
    }
    this.datasetName = this.props.dataset.value;

    return (<>
      <div
        style={{width: '100%', height: '100%'}}
        ref={ref => {this.visElement = ref}}
        draggable
        onDragStart={this.onVisDrag}
      />

      
    </>);
  }
}

export default withStyles(visStyles)(GraphVisComponent);
