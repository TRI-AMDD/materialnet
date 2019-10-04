import geo from 'geojs/geo.min.js';
import { debounce } from 'lodash-es';

const FOCUS_OPACITY = 0.8; // selection or pinned
const NOFOCUS_OPACITY = 0.8; // in case of no focus

const DEFOCUS_OPACITY = 0.8; // not in focus if focus is present

const CONTEXT_OPACITY = 0.03; // background if subgraph is present

const SELECTION_STROKE_COLOR = 'orange';
const PINNED_STROKE_COLOR = 'black';
const PINNED_NIGHT_STROKE_COLOR = 'black';
const DEFAULT_STROKE_COLOR = 'black';
const DEFAULT_NIGHT_STROKE_COLOR = 'black';

const SELECTION_STROKE_WIDTH = 3;
const PINNED_STROKE_WIDTH = 2;
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
    this.pinned = new Set();
    this.subGraphNodes = new Set();

    this.linkOpacity = 0.01;
    this.linesVisible = false;
    this.positionOverrides = {};
    this.linesNeedsToBeModified = false;
  }

  initScene(zoomRange) {
    this.map = null;
    const dp = this.dp;

    if (!this.parent || !this.dp) {
      return false;
    }

    const bounds = dp.getBounds();
    const params = geo.util.pixelCoordinateParams(this.parent, bounds.maxx - bounds.minx, bounds.maxy - bounds.miny);

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
        position: this._position,
        width: 1,
        strokeColor: 'black',
        strokeOpacity: this.linkOpacity,
      })
      .visible(this.linesVisible); // disable by default

    this.highlightLines = layer.createFeature('line')
      .data([])
      .style({
        position: this._position,
        width: 1,
        strokeColor: 'black',
        strokeOpacity: this.linkOpacity,
      })
      .visible(this.linesVisible && this._isHighlighted());

    const points = this.points = layer.createFeature('point', {
      // primitiveShape: 'triangle',
      style: {
        strokeColor: this._strokeColor,
        strokeWidth: this._strokeWidth,
        fillColor: 'gray',
        strokeOpacity: this._nodeOpacity,
        fillOpacity: this._nodeOpacity,
        radius: 10,
      },
      position: this._position,
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

    let lastPointEvent = null;
    points.geoOn(geo.event.feature.mouseclick, evt => {
      if (evt.top) {
        this.picked(this.dp.nodes[evt.data], evt.mouse.modifiers);
      }
      lastPointEvent = evt.mouse;
    });
    this.map.geoOn(geo.event.mouseclick, debounce((evt) => {
      if (lastPointEvent && lastPointEvent.time === evt.time) {
        return;
      }
      // seems like we have a click that didn't hit something
      this.picked(null, {});
    }, 100));

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
    return this.subGraphNodes.size > 0;
  }

  _position = (name) => {
    const pos = this.positionOverrides[name] || this.dp.nodePosition(name);
    if (this.expansion === 1) {
      return pos;
    }
    return {
      x: pos.x * this.expansion,
      y: pos.y * this.expansion
    };
  }

  setPositions(overrides) {
    this.positionOverrides = overrides;

    this.points.dataTime().modified();
    if (this.lines.visible()) {
      this.linesNeedsToBeModified = true;
      this.lines.dataTime().modified();
    }
    if (this.highlightLines.visible()) {
      this.highlightLines.dataTime().modified();
    }
    this.map.draw();
  }

  _strokeWidth = (name) => {
    if (name === this.selected) {
      return SELECTION_STROKE_WIDTH;
    }
    if (this.pinned.has(name)) {
      return PINNED_STROKE_WIDTH;
    }
    return DEFAULT_STROKE_WIDTH;
  }

  _strokeColor = (name) => {
    if (name === this.selected) {
      return SELECTION_STROKE_COLOR;
    }
    if (this.pinned.has(name)) {
      return PINNED_STROKE_COLOR;
    }
    return DEFAULT_STROKE_COLOR;
  }

  _darkStrokePointColor = (name) => {
    if (name === this.selected) {
      return SELECTION_STROKE_COLOR;
    }
    if (this.pinned.has(name)) {
      return PINNED_NIGHT_STROKE_COLOR;
    }
    return DEFAULT_NIGHT_STROKE_COLOR;
  }

  _nodeOpacity = (name) => {
    const hasFocus = this.selected || this.pinned.size > 0;
    if (name === this.selected || this.pinned.has(name)) {
      return FOCUS_OPACITY;
    }
    if (this.subGraphNodes.size === 0 || this.subGraphNodes.has(name)) {
      // full graph no sub graph
      return hasFocus ? DEFOCUS_OPACITY : NOFOCUS_OPACITY;
    }

    return CONTEXT_OPACITY;
  }

  _handleNodeSpacing() {
    let deltaDirection = null;

    const handle = () => {
      // run when we have both
      if (deltaDirection == null || this.nextExpansionFocus == null) {
        return;
      }
      this.onNodeSpacingChanged(deltaDirection);
      deltaDirection = null;
    };

    // since not provided by geojs
    this.parent.onwheel = (evt) => {
      deltaDirection = evt.deltaY;
      handle();
    };

    // Capture the mouse coordinates on a first mousewheel event in a sequence.
    this.map.geoOn(geo.event.actionwheel, (evt) => {
      if (!evt.mouse.modifiers.ctrl) {
        return;
      }
      if (!this.nextExpansionFocus) {
        this.nextExpansionFocus = evt.mouse.geo;
      }
      handle();
    });

    // Clear the mouse coordinates as soon as the mouse moves.
    this.map.geoOn(geo.event.mousemove, () => {
      this.nextExpansionFocus = null;
    });
  }

  setData(nodes, edges) {
    if (!this.map) {
      return;
    }
    this.points.data(nodes);
    this.lines.data(edges);
    // recompute subgraph can shrink or grow
    this.showSubGraph([]);
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

      // Expand the click position in order to work around a bug in GeoJS.
      this.nextExpansionFocus.x *= factor;
      this.nextExpansionFocus.y *= factor;
    } else {
      this.map.center({
        x: factor * center.x,
        y: factor * center.y
      });
    }

    this.points.dataTime().modified();
    if (this.lines.visible()) {
      this.linesNeedsToBeModified = true;
      this.lines.dataTime().modified();
    }
    if (this.highlightLines.visible()) {
      this.highlightLines.dataTime().modified();
    }
    this.map.draw();
  }

  setLinkOpacity (value) {
    this.linkOpacity = value;
    this.lines.style('strokeOpacity', this.linkOpacity);
    this.highlightLines.style('strokeOpacity', this.linkOpacity);

    if (this.lines.visible()) {
      this.linesNeedsToBeModified = true;
      this.lines.modified();
    }
    if (this.highlightLines.visible()) {
      this.highlightLines.modified();
    }
    this.map.draw();
  }

  hideAfter() {}

  setNodeSize(scale, factor) {
    this.points.style('radius', (nodeId) => factor * scale(this.dp.nodes[nodeId]));
    if (this.map) {
      this.map.draw();
    }
  }

  pickName (name) {
    if (!this.dp.hasNode(name)) {
      return null;
    }

    return this.dp.nodes[name];
  }

  showSubGraph(subGraphNodes) {
    this.subGraphNodes = new Set(subGraphNodes);

    this._updateEdgeHighlights();

    this.points.modified();
    this.map.draw();
  }

  _updateEdgeHighlights() {
    const isHighlighted = this._isHighlighted();

    const allLinesVisible = this.linesVisible && !isHighlighted;
    this.lines.visible(allLinesVisible);
    if (allLinesVisible && this.linesNeedsToBeModified) {
      this.lines.dataTime().modified();
      this.linesNeedsToBeModified = false;
    }

    if (!isHighlighted || !this.linesVisible) {
      // no highlight lines
      this.highlightLines.visible(false);
      this.highlightLines.data([]);
      return;
    }

    this.highlightLines.data(this.lines.data().filter(([a, b]) => this.subGraphNodes.has(a) && this.subGraphNodes.has(b)));
    this.highlightLines.visible(true);
  }

  setSelected(selected, pinned) {
    this.selected = selected;
    this.pinned = new Set(pinned);
    this.points.modified();

    this.map.draw();
  }

  linksVisible(show) {
    this.linesVisible = show;
    this._updateEdgeHighlights();
    this.map.draw();
  }

  setNightMode (night) {
    const bgColor = night ? 'black' : 'white';
    const strokeColor = night ? 'white' : 'black';
    const pointStrokeColor = night ? this._darkStrokePointColor : this._strokeColor;

    this.parent.style.backgroundColor = bgColor;
    this.points.style('strokeColor', pointStrokeColor);
    this.lines.style('strokeColor', strokeColor);
    this.highlightLines.style('strokeColor', strokeColor);
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
