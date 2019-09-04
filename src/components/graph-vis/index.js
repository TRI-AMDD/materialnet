import React, { Component } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { GeoJSSceneManager } from '../../geojs-scene-manager';
import Store from '../../store';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';


@observer
class GraphVisComponent extends Component {
  static contextType = Store;

  visElement;
  scene = new GeoJSSceneManager({
    onZoomChanged: (val) => this.context.zoom = val,
    picked: (data, position) => {
      this.context.selectNode(data, position);
    },
  });

  dragging = {
    status: false,
    start: {x: 0, y: 0}
  }
  ro;

  autoRunListeners = [];

  clearSceneListener() {
    this.autoRunListeners.forEach((v) => v());
    this.autoRunListeners = [];
  }

  initSceneListener() {
    const store = this.context;

    const setAndObserve = (f) => {
      this.autoRunListeners.push(autorun(f));
    };
    setAndObserve(() => {
      this.scene.zoom = store.zoom;
    });
    setAndObserve(() => {
      this.scene.expand(store.spacing);
    });
    setAndObserve(() => {
      this.scene.hideAfter(store.year);
      if (store.size !== 'none') {
        this.scene.setDegreeSize(store.year, store.size);
      }
    });
    setAndObserve(() => {
      this.scene.setLinkOpacity(store.opacity);
    });
    setAndObserve(() => {
      const obj = this.scene.pickName(store.search);
      if (obj) {
        this.scene.display(store.search, true);
      } else {
        store.clearSelection();
      }
    });
    setAndObserve(() => {
      if (store.selected == null) {
        this.scene.undisplay();
      } else {
        this.scene.display(store.selected.name);
      }
    });
    setAndObserve(() => {
      this.scene.linksVisible(store.linksVisible);
    });
    setAndObserve(() => {
      this.scene.setNightMode(store.nightMode);
    });

    setAndObserve(() => {
      switch (store.color) {
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
          this.scene.setUndiscoveredColor(store.colorYear);
          break;

        default:
          this.scene.setPropertyColor(store.color);
      }
    });
  }

  componentDidMount() {
    this.scene.parent = this.visElement;
    this.ro = new ResizeObserver(() => {
      this.scene.resize();
    });

    this.ro.observe(this.visElement);

    if (this.scene.initScene()) {
      this.startAnimation();
    }
  }

  startAnimation() {
    this.clearSceneListener();

    // set defaults
    this.initSceneListener();

    // dummy render function in GeoJSSceneManager
    // const animate = () => {
    //   if (!this.scene.parent || !this.scene.dp) {
    //     return;
    //   }
    //   this.scene.render();
    //   window.requestAnimationFrame(animate);
    // }
    // window.requestAnimationFrame(animate);

  }

  componentWillUnmount() {
    if (this.ro) {
      this.ro.unobserve(this.visElement);
    }

    this.clearSceneListener();
    this.scene.clear();
    this.scene.parent = null;
  }

  onVisDrag = (event) => {
    event.preventDefault();
    this.dragging.status = true;
    this.dragging.start = {x: event.clientX, y: event.clientY};

    const linksOn = this.context.showLinks;
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
    const store = this.context;

    if (this.scene.dp !== store.data) {
      // data has changed
      this.scene.clear();
      this.scene.dp = store.data;
      if (this.scene.initScene()) {
        this.startAnimation();
      }
    }

    return (
      <div
        style={{width: '100%', height: '100%'}}
        ref={ref => {this.visElement = ref}}
        draggable
        onDragStart={this.onVisDrag}
      />);
  }
}

export default GraphVisComponent;
