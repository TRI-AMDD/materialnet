import geo from 'geojs';

const FOCUS_OPACITY = 0.8;
const DEFOCUS_OPACITY = 0.05;
const DEFOCUS_EDGE_OPACITY = 0;
const SELECTION_STROKE_WIDTH = 4;
const FOCUS_STROKE_WIDTH = 3;
const DEFAULT_STROKE_WIDTH = 1;

export class GeoJSSceneManager {
  constructor({ onZoomChanged, picked, hovered, hoveredLine, onNodeSpacingChanged }) {
    this.dp = null;
    this.parent = null;
    this.onZoomChanged = onZoomChanged;
    this.onNodeSpacingChanged = onNodeSpacingChanged;
    this.picked = picked;
    this.hovered = hovered;
    this.hoveredLine = hoveredLine;
    this.nextExpansionFocus = null;
    this.map = null;

    this.expansion = 1;
    this.selected = null;
    this.focus = new Set();
    this.linkOpacity = 0.01;
  }

  initScene(zoomRange) {
    this.map = null;
    const dp = this.dp;

    if (!this.parent || !this.dp) {
      return false;
    }

    const bounds = dp.getBounds();
    let params = geo.util.pixelCoordinateParams(this.parent, bounds.maxx - bounds.minx, bounds.maxy - bounds.miny);

    // the utility function assumes top left is 0, 0.  Move it to minx, miny.
    params.map.maxBounds.left += bounds.minx;
    params.map.maxBounds.top += bounds.miny;
    params.map.maxBounds.right += bounds.minx;
    params.map.maxBounds.bottom += bounds.miny;
    params.map.center.x += bounds.minx;
    params.map.center.y += bounds.miny;

    // inflate the bounds to add a border
    const maxwh = Math.max(bounds.maxx - bounds.minx, bounds.maxy - bounds.miny);
    const factor = 0.5;
    params.map.maxBounds.left -= maxwh * factor;
    params.map.maxBounds.top -= maxwh * factor;
    params.map.maxBounds.right += maxwh * factor;
    params.map.maxBounds.bottom += maxwh * factor;

    // allow zoomming in until 1 unit of space is 2^(value) bigger.
    params.map.min = zoomRange[0];
    params.map.max = zoomRange[1];
    params.map.allowRotation = false;
    params.map.clampBoundsY = params.map.clampBoundsX = false;

    const map = this.map = geo.map(params.map);

    const layer = map.createLayer('feature', {
      features: [
        'point',
        'line',
      ],
    });

    this.lines = layer.createFeature('line')
      .data(dp.edges)
      .style({
        position: this._position.bind(this),
        width: 1,
        strokeColor: 'black',
        strokeOpacity: () => this.linkOpacity,
      })
      .visible(false); // disable by default

    const points = this.points = layer.createFeature('point', {
      // primitiveShape: 'triangle',
      style: {
        strokeColor: 'black',
        strokeWidth: this._strokeWidth.bind(this),
        fillColor: 'gray',
        strokeOpacity: FOCUS_OPACITY,
        fillOpacity: FOCUS_OPACITY,
        radius: 10,
      },
      position: this._position.bind(this),
    })
      .data(dp.nodeNames());

    let onNode = null;

    points.geoOn(geo.event.feature.mouseon, evt => {
      onNode = this.dp.nodes[evt.data];

      // compute point dimensions
      const radius = points.style("radius")(evt.data);
      // position relative to canvas
      const position = this.points.featureGcsToDisplay(points.position()(evt.data));
      this.hovered(onNode, position, radius);
    });
    points.geoOn(geo.event.feature.mouseoff, evt => {
      onNode = null;
      this.hovered(null, null, null);
    });
    points.geoOn(geo.event.feature.mouseclick, evt => {
      if (evt.top) {
        this.picked(this.dp.nodes[evt.data], evt.mouse.modifiers.ctrl);
      }
    });

    // NOTE: disable line hovering for now till figured out where to show
    // let onLine = null;
    // lines.geoOn(geo.event.feature.mouseon, evt => {
    //   if (onNode) {
    //     return;
    //   }
    //   onLine = evt.data.map((d) => this.dp.nodes[d]);
    //   this.hoveredLine(onLine[0], onLine[1], evt.mouse.geo);
    // });
    // lines.geoOn(geo.event.feature.mousemove, evt => {
    //   this.hoveredLine(onLine[0], onLine[1], evt.mouse.geo);
    // });
    // lines.geoOn(geo.event.feature.mouseoff, evt => {
    //   if (onNode) {
    //     return;
    //   }
    //   onLine = null;
    //   this.hoveredLine(null, null, null);
    // });

    map.geoOn(geo.event.zoom, () => {
      points.dataTime().modified();
      this.onZoomChanged(map.zoom());
    });

    this._handleNodeSpacing();

    map.draw();

    return true;
  }

  _isHighlighted() {
    return this.selected != null || this.focus.size > 0;
  }

  _position(name) {
    const pos = this.dp.nodePosition(name);
    if (this.expansion === 1) {
      return pos;
    }
    return {
      x: pos.x * this.expansion,
      y: pos.y * this.expansion
    };
  }

  _strokeWidth(name) {
    if (name === this.selected) {
      return SELECTION_STROKE_WIDTH;
    } else if (this.focus.has(name)) {
      return FOCUS_STROKE_WIDTH;
    }
    return DEFAULT_STROKE_WIDTH;
  }

  _strokeSelectedEdgeColor(nodes) {
    return (_node, _idx, edge) => {
      if (nodes.has(edge[0]) && nodes.has(edge[1])) {
        return this.linkOpacity;
      }
      return DEFOCUS_EDGE_OPACITY;
    };
  }

  _handleNodeSpacing() {
    let deltaDirection = null;
    let position = null;

    const handle = () => {
      // run when we have both
      if (deltaDirection == null || position == null) {
        return;
      }
      this.nextExpansionFocus = position;
      this.onNodeSpacingChanged(deltaDirection);
      deltaDirection = null;
      position = null;
    };

    // since not provided by geojs
    this.parent.onwheel = (evt) => {
      deltaDirection = evt.deltaY;
      handle();
    };
    this.map.geoOn(geo.event.actionwheel, (evt) => {
      if (!evt.mouse.modifiers.ctrl) {
        return;
      }
      position = evt.mouse.geo;
      handle();
    });
  }

  setData(nodes, edges) {
    if (!this.map) {
      return;
    }
    this.points.data(nodes);
    this.lines.data(edges);
    this.map.draw();
  }

  expand(m) {
    if (this.expansion === m) {
      return;
    }

    const factor = m / this.expansion;

    this.expansion = m;
    if (!this.map) {
      return;
    }

    const center = this.map.center();
    if (this.nextExpansionFocus) {
      // set when the user zoomed in via mouse
      const offCenter = {
        x: this.nextExpansionFocus.x - center.x,
        y: this.nextExpansionFocus.y - center.y
      };

      // same distance from the visible center as before but the new target
      this.map.center({
        x: factor * this.nextExpansionFocus.x - offCenter.x,
        y: factor * this.nextExpansionFocus.y - offCenter.y
      });
      this.nextExpansionFocus = null;
    } else {
      this.map.center({
        x: factor * center.x,
        y: factor * center.y
      });
    }

    this.points.dataTime().modified();
    this.lines.dataTime().modified();
    this.map.draw();
  }

  setLinkOpacity (value) {
    this.linkOpacity = value;
    if (!this._isHighlighted()) { // in the highlight case, the function handles the update
      this.lines.style('strokeOpacity', this.linkOpacity);
    }
    this.lines.modified();
    this.map.draw();
  }

  hideAfter() {}

  setNodeSize(scale, factor) {
    this.points.style('radius', (nodeId) => factor * scale(this.dp.nodes[nodeId]));
    this.map.draw();
  }

  pickName (name) {
    if (!this.dp.hasNode(name)) {
      return null;
    }

    return this.dp.nodes[name];
  }

  display (name) {
    this.selected = name;
    this.focus = new Set();

    const onehop = this.dp.neighborsOf(name);

    this._focusNodes(onehop);
  }

  _focusNodes(nodes) {
    // Set opacity of all nodes in accordance with membership in the
    // neighborhood.
    this.points.style('fillOpacity', (nodeId) => nodes.has(nodeId) ? FOCUS_OPACITY : DEFOCUS_OPACITY);
    this.points.style('strokeOpacity', (nodeId) => nodes.has(nodeId) ? FOCUS_OPACITY : DEFOCUS_OPACITY);

    // Same for edges.
    this.lines.style('strokeOpacity', this._strokeSelectedEdgeColor(nodes));

    this.map.draw();
  }

  displayFocus(pinned, selected) {
    this.focus = new Set(pinned);
    this.selected = selected;

    if (this.focus.size === 0 && !selected) {
      this.undisplay();
      return;
    }

    const onehop = this.dp.neighborsOf(this.focus);
    if (selected) {
      onehop.add(selected); // at least highlight it
    }
    this._focusNodes(onehop);
  }

  undisplay() {
    this.selected = null;
    this.focus = new Set();

    if (!this.map) {
      return;
    }
    this.points.style('fillOpacity', FOCUS_OPACITY);
    this.points.style('strokeOpacity', FOCUS_OPACITY);
    this.lines.style('strokeOpacity', this.linkOpacity);
    this.map.draw();
  }

  linksVisible (show) {
    this.lines.visible(show);
    this.map.draw();
  }

  setNightMode (night) {
    const bgColor = night ? 'black' : 'white';
    const strokeColor = night ? 'white' : 'black';
    const linkColor = strokeColor;

    this.parent.style.backgroundColor = bgColor;
    this.lines.style('strokeColor', linkColor);
    this.map.draw();
  }

  setNodeColor(scale) {
    this.points.style('fillColor', (nodeId) => scale(this.dp.nodes[nodeId]));
    this.map.draw();
  }

  render () {}
  resize() {
    if (!this.map || !this.parent) {
      return;
    }
    this.map.size(this.parent.getBoundingClientRect());
  }
  pick () {}
  moveCamera () {}
  clear () {}

  get zoom () {
    return this.map.zoom();
  }

  set zoom (zoom) {
    this.map.zoom(zoom);
  }
}
