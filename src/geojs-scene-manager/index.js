import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { color as d3Color } from 'd3-color';
import { select } from 'd3-selection';

import geo from 'geojs';

import './tooltip.css';

export class GeoJSSceneManager {
  constructor({el, dp, onValueChanged, picked}) {
    this.parent = el;
    this.initScene(dp);
    this.onValueChanged = onValueChanged;
    this.picked = picked;
    this.lineSelected = new Set([]);
    this.expansion = 1;
  }

  initScene(dp) {
    this.dp = dp;

    const degrees = dp.nodeDegrees(2020);

    let nodes = this.nodes = {};
    dp.nodeNames().forEach(name => {
      const pos = dp.nodePosition(name);
      nodes[name] = {
        x: pos.x,
        y: pos.y,
        degree: degrees[name],
      };
    });

    const xs = Object.values(nodes).map(d => d.x);
    const ys = Object.values(nodes).map(d => d.y);

    const bounds = {
      minx: Math.min(...xs),
      maxx: Math.max(...xs),
      miny: Math.min(...ys),
      maxy: Math.max(...ys),
    };

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
    params.map.max += 3;
    params.map.min -= 3;

    const map = this.map = geo.map(params.map);

    const layer = map.createLayer('feature', {
      features: [
        'point',
        'line',
      ],
    });

    const edges = dp.edges;
    const lines = this.lines = layer.createFeature('line')
      .data(edges)
      .style({
        position: name => nodes[name],
        width: 1,
        strokeColor: 'black',
        strokeOpacity: 0.1,
      });

    const points = this.points = layer.createFeature('point', {
      // primitiveShape: 'triangle',
      style: {
        strokeColor: 'black',
        fillColor: 'gray',
        strokeOpacity: 0.8,
        fillOpacity: 0.8,
        radius: name => Math.max(2, Math.sqrt(nodes[name].degree)),
      },
      position: name => nodes[name],
    })
      .data(Object.keys(nodes));

    const ui = map.createLayer('ui', {
      zIndex: 2,
    });

    const tooltip = ui.createWidget('dom', {
      position: {
        x: 0,
        y: 0,
      },
    });

    const tooltipElem = tooltip.canvas();
    tooltipElem.setAttribute('id', 'tooltip');
    tooltipElem.classList.toggle('hidden', true);
    tooltipElem.style['pointer-events'] = 'none';

    let onNode = false;

    points.geoOn(geo.event.feature.mouseon, evt => {
      onNode = true;

      const name = evt.data;
      const node = nodes[name];

      tooltip.position(evt.mouse.geo);
      tooltipElem.innerText = name;
      tooltipElem.classList.toggle('hidden', false);
    });
    points.geoOn(geo.event.feature.mousemove, evt => {
      tooltip.position(evt.mouse.geo);
    });
    points.geoOn(geo.event.feature.mouseoff, evt => {
      onNode = false;

      tooltipElem.classList.toggle('hidden', true);
    });
    points.geoOn(geo.event.feature.mouseclick, evt => {
      if (evt.top) {
        const data = this.pickName(evt.data);
        this.picked(data);
      }
    });

    lines.geoOn(geo.event.feature.mouseon, evt => {
      if (onNode) {
        return;
      }

      const text = `${evt.data[0]} - ${evt.data[1]}`;

      tooltip.position(evt.mouse.geo);
      tooltipElem.innerText = text;
      tooltipElem.classList.toggle('hidden', false);
    });
    lines.geoOn(geo.event.feature.mousemove, evt => {
      tooltip.position(evt.mouse.geo);
    });
    lines.geoOn(geo.event.feature.mouseoff, evt => {
      if (onNode) {
        return;
      }

      tooltipElem.classList.toggle('hidden', true);
    });

    map.geoOn(geo.event.zoom, () => {
      points.dataTime().modified();
      this.onValueChanged(map.zoom(), 'zoom');
    });

    map.draw();
  }

  expand (m) {
    const factor = m / this.expansion;
    this.expansion = m;

    let expanded = {...this.nodes};
    Object.keys(expanded).forEach(node => {
      expanded[node].x *= factor;
      expanded[node].y *= factor;
    });

    const positioner = name => expanded[name];

    this.points.position(positioner);
    this.lines.position(positioner);

    this.map.draw();
  }

  setLinkOpacity (value) {
    this.linkOpacity = value;
    if (this.selected) {
      this.lines.style('strokeOpacity', (node, idx, edge) => {
        if (this.lineSelected.has(edge[0]) && this.lineSelected.has(edge[1])) {
          return value;
        } else {
          return 0;
        }
      });
    } else {
      this.lines.style('strokeOpacity', value);
    }
    this.lines.modified();
    this.map.draw();
  }

  hideAfter () {}

  setDegreeSize (year, level) {
    // const zoom = Math.pow(2, this.map.zoom());

    if (level === 'none') {
      this.points.style('radius', () => {
        return Math.pow(2, this.map.zoom()) * 10;
      });
      this.map.draw();
    } else {
      const degrees = this.dp.nodeDegrees(year);

      let sizes = [];
      this.dp.nodeNames().forEach((name, i) => {
        const deg = degrees[name];

        switch(level) {
          case 'normal':
            sizes[i] = 10 + Math.sqrt(deg);
            break;

          case 'large':
            sizes[i] = 10 + Math.sqrt(Math.sqrt(deg * deg * deg));
            break;

          case 'huge':
            sizes[i] = 10 + deg;
            break;

          default:
            throw new Error(`bad level option: ${level}`);
            break;
        }
      });

      this.points.style('radius', (nodeId, i) => Math.pow(2, this.map.zoom()) * sizes[i]);
      this.map.draw();
    }
  }

  pickName (name) {
    if (!this.dp.hasNode(name)) {
      return null;
    }

    const data = {
      name,
      degree: this.dp.nodeProperty(name, 'degree'),
      discovery: this.dp.nodeProperty(name, 'discovery'),
      formationEnergy: this.dp.nodeProperty(name, 'formation_energy'),
      synthesisProbability: this.dp.nodeProperty(name, 'synthesis_probability'),
      clusCoeff: this.dp.nodeProperty(name, 'clus_coeff'),
      eigenCent: this.dp.nodeProperty(name, 'eigen_cent'),
      degCent: this.dp.nodeProperty(name, 'deg_cent'),
      shortestPath: this.dp.nodeProperty(name, 'shortest_path'),
      degNeigh: this.dp.nodeProperty(name, 'deg_neigh')
    };

    return data;
  }

  display (name) {
    this.selected = name;

    // Collect neighborhood of selected node.
    let onehop = new Set([]);
    for(let i = 0; i < this.dp.edgeCount(); i++) {
      const edge = this.dp.edgeNodes(i);

      if (name === edge[0] || name === edge[1]) {
        onehop.add(edge[0]);
        onehop.add(edge[1]);
      }
    }

    // Set opacity of all nodes in accordance with membership in the
    // neighborhood.
    let focus = 0.8;
    let defocus = 0.05;
    this.points.style('fillOpacity', (nodeId) => onehop.has(nodeId) ? focus : defocus);
    this.points.style('strokeOpacity', (nodeId) => onehop.has(nodeId) ? focus : defocus);

    // Same for edges.
    const lineFocus = this.linkOpacity;
    const lineDefocus = 0;
    this.lines.style('strokeOpacity', (node, idx, edge) => {
      if (onehop.has(edge[0]) && onehop.has(edge[1])) {
        this.lineSelected.add(edge[0]);
        this.lineSelected.add(edge[1]);

        return lineFocus;
      } else {
        this.lineSelected.delete(edge[0]);
        this.lineSelected.delete(edge[1]);

        return lineDefocus;
      }
    });

    this.map.draw();
  }

  undisplay () {
    this.points.style('fillOpacity', 0.8);
    this.points.style('strokeOpacity', 0.8);
    this.setLinkOpacity(this.linkOpacity);

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

    select(this.parent)
      .style('background-color', bgColor);
    this.lines.style('strokeColor', linkColor);
    this.map.draw();
  }

  setConstColor () {
    this.points.style('fillColor', `rgb(${0.2 * 255}, ${0.3 * 255}, ${0.8 * 255})`);
    this.map.draw();
  }

  setBooleanColor () {
    let colors = [];
    this.dp.nodeNames().forEach((name, i) => {
      const exists = this.dp.nodeExists(name);
      const color = exists ? 'rgb(81,96,204)' : '#de2d26';

      colors[i] = color;
    });

    this.points.style('fillColor', (nodeId, i) => colors[i]);
    this.map.draw();
  }

  setPropertyColor (prop) {
    const [low, high] = this.propMinMax(prop);

    this.cmap = scaleSequential(interpolateViridis)
      .domain([low, high]);

    let colors = [];
    this.dp.nodeNames().forEach((name, i) => {
      const val = this.dp.nodeProperty(name, prop);

      let color = this.cmap(val);
      if (!color) {
        color = '#ff0000';
      }

      colors[i] = color;
    });

    this.points.style('fillColor', (nodeId, i) => colors[i]);
    this.map.draw();
  }

  setDiscoveryColor () {
    this.cmap = scaleSequential(interpolateViridis)
      .domain([1945, 2015]);

    let colors = [];
    this.dp.nodeNames().forEach((name, i) => {
      const discovery = this.dp.nodeProperty(name, 'discovery');

      let color;
      if (discovery !== null) {
        color = (this.cmap(discovery));
      } else {
        color = ('#de2d26');
      }

      colors.push(color);
    });

    this.points.style('fillColor', (nodeId, i) => colors[i]);
    this.map.draw();
  }

  propMinMax (prop) {
    const props = this.dp.nodeNames()
      .map(name => this.dp.nodeProperty(name, prop))
      .filter(d => d !== undefined);

    return [
      Math.min.apply(null, props),
      Math.max.apply(null, props)
    ];
  }

  setUndiscoveredColor (year) {
    let colors = [];
    this.dp.nodeNames().forEach((name, i) => {
      const existsYet = this.dp.nodeExists(name) && this.dp.nodeProperty(name, 'discovery') <= year;
      const color = existsYet ? 'rgb(81,96,204)' : '#de2d26';

      colors[i] = color;
    });

    this.points.style('fillColor', (nodeId, i) => colors[i]);
    this.map.draw();
  }

  render () {}
  resize () {}
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
