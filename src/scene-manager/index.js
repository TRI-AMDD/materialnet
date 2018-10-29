import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { color as d3Color } from 'd3-color';

import * as three from 'three';

import infopanel from './infopanel.pug';

import vertShader from './shader/circle-vert.glsl';
import fragShader from './shader/circle-frag.glsl';
import lineVertShader from './shader/line-vert.glsl';
import lineFragShader from './shader/line-frag.glsl';

export class SceneManager {
  constructor ({el, dp}) {
    const width = el.clientWidth;
    const height = el.clientHeight;
    this.width = width;
    this.height = height;
    this.parent = el;
    this.dp = dp;

    this.scene = new three.Scene();
    this.scene.background = new three.Color(0xeeeeee);

    this.camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1);

    this.raycaster = new three.Raycaster();
    this.threshold = 6;
    this.raycaster.params.Points.threshold = this.threshold;

    this.mouse = new three.Vector2();
    this.pixel = new three.Vector2();

    this.expansion = 1;
    this.attenuation = 0.02;

    this.renderer = new three.WebGLRenderer({
      antialias: true
    });

    this.el = this.renderer.domElement;
    select(el).append(() => this.el);

    // Initialize edge geometry.
    let positions = [];
    let focus = [];
    let hidden = [];

    this.linkIndex = {};
    for (let i = 0; i < this.dp.edgeCount(); i++) {
      const edgePos = this.dp.edgePosition(i);
      positions.push(edgePos[0].x, edgePos[0].y, -0.1);
      positions.push(edgePos[1].x, edgePos[1].y, -0.1);

      focus.push(1.0, 1.0);

      hidden.push(0, 0);
    }

    this.edgeGeom = new three.BufferGeometry();
    this.edgeGeom.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.edgeGeom.addAttribute('focus', new three.Float32BufferAttribute(focus, 1).setDynamic(true));
    this.edgeGeom.addAttribute('hidden', new three.Float32BufferAttribute(hidden, 1).setDynamic(true));
    this.edgeGeom.computeBoundingSphere();

    this.lineMaterial = new three.ShaderMaterial({
      uniforms: {
        opacity: {
          value: 0.05
        }
      },
      vertexShader: lineVertShader,
      fragmentShader: lineFragShader
    });
    this.lineMaterial.transparent = true;

    this.lines = new three.LineSegments(this.edgeGeom, this.lineMaterial);
    this._linksVisible = true;
    this.scene.add(this.lines);

    // Create a sequential colormap.
    this.cmap = scaleLinear()
      .domain([1945, 1980, 2015])
      .range(['#7570b3', '#d95f02', '#1b9e77']);

    // Initialize point geometry.
    positions.length = 0;
    focus.length = 0;
    hidden.length = 0;
    let colors = [];
    let sizes = [];
    let selected = [];

    this.index = {};

    this.dp.nodeNames().forEach(name => {
      const p = this.dp.nodePosition(name);

      positions.push(p.x, p.y, 0);

      this.index[name] = positions.length / 3 - 1;

      let color;
      const discovery = this.dp.nodeProperty(name, 'discovery');
      if (discovery !== null) {
        color = d3Color(this.cmap(discovery));
      } else {
        color = d3Color('#de2d26');
      }

      colors.push(color.r / 255, color.g / 255, color.b / 255);

      sizes.push(10);
      selected.push(0);
      focus.push(1);
      hidden.push(0);
    });

    this.selected = null;

    this.geometry = new three.BufferGeometry();
    this.geometry.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.geometry.addAttribute('color', new three.Float32BufferAttribute(colors, 3).setDynamic(true));
    this.geometry.addAttribute('size', new three.Float32BufferAttribute(sizes, 1).setDynamic(true));
    this.geometry.addAttribute('selected', new three.Float32BufferAttribute(selected, 1).setDynamic(true));
    this.geometry.addAttribute('focus', new three.Float32BufferAttribute(focus, 1).setDynamic(true));
    this.geometry.addAttribute('hidden', new three.Float32BufferAttribute(hidden, 1).setDynamic(true));
    this.geometry.computeBoundingSphere();

    this.material = new three.ShaderMaterial({
      vertexColors: three.VertexColors,
      uniforms: {
        color: new three.Color(1.0, 0.0, 0.0),
        zoom: {
          value: this.zoom
        }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    });
    this.material.transparent = true;

    this.points = new three.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.setDegreeSize(2017);

    this.resize();
  }

  resize() {
    const width = this.parent.clientWidth;
    const height = this.parent.clientHeight;
    this.renderer.setSize(width, height);
  }

  linksVisible (vis) {
    this._linksVisible = vis;
    this.lines.visible = this._linksVisible;
  }

  setLinkOpacity (o) {
    this.lineMaterial.uniforms.opacity.value = o;
  }

  setConstSize (s) {
    this.degreeSize = false;

    for(let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      this.setSize(i, s);
    }

    this.updateSize();
  }

  setDegreeSize (year) {
    this.degreeSize = true;

    const degrees = this.dp.nodeDegrees(year);

    this.dp.nodeNames().forEach((name, i) => {
      this.setSize(i, 10 + Math.sqrt(degrees[name]));
    });

    this.updateSize();
  }

  setConstColor (r, g, b) {
    for(let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      this.setColor(i, r, g, b);
    }

    this.updateColor();
  }

  setDiscoveryColor () {
    this.undiscoveredColor = false;

    this.dp.nodeNames().forEach((name, i) => {
      const discovery = this.dp.nodeProperty(name, 'discovery');

      let color;
      if (discovery !== null) {
        color = d3Color(this.cmap(discovery));
      } else {
        color = d3Color('#de2d26');
      }

      this.setColor(i, color.r / 255, color.g / 255, color.b / 255);
    });

    this.updateColor();
  }

  setBooleanColor () {
    this.undiscoveredColor = false;

    this.dp.nodeNames().forEach((name, i) => {
      const exists = this.dp.nodeExists(name);
      const color = exists ? d3Color('rgb(81,96,204)') : d3Color('#de2d26');

      this.setColor(i, color.r / 255, color.g / 255, color.b / 255);
    });

    this.updateColor();
  }

  setUndiscoveredColor (year) {
    this.undiscoveredColor = true;

    this.dp.nodeNames().forEach((name, i) => {
      const existsYet = this.dp.nodeExists(name) && this.dp.nodeProperty(name, 'discovery') <= year;
      const color = existsYet ? d3Color('rgb(81,96,204)') : d3Color('#de2d26');

      this.setColor(i, color.r / 255, color.g / 255, color.b / 255);
    });

    this.updateColor();
  }

  setColorYear (year) {
    if (this.undiscoveredColor) {
      this.setUndiscoveredColor(year);
    }
  }

  on (eventType, cb) {
    select(this.el).on(eventType, cb.bind(this));
  }

  pick () {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const results = this.raycaster.intersectObject(this.points);
    if (results.length > 0) {
      return results[0];
    }
    return null;
  }

  setColor (idx, r, g, b, update = true) {
    this.geometry.attributes.color.array[3 * idx + 0] = r;
    this.geometry.attributes.color.array[3 * idx + 1] = g;
    this.geometry.attributes.color.array[3 * idx + 2] = b;

    if (update) {
      this.updateColor();
    }
  }

  updateColor () {
    this.geometry.attributes.color.needsUpdate = true;
  }

  getPosition (idx) {
    const pos = this.geometry.attributes.position.array;
    return new three.Vector2(pos[3 * idx + 0], pos[3 * idx + 1]);
  }

  setPosition (idx, x, y, update = true) {
    this.geometry.attributes.position.array[3 * idx + 0] = x;
    this.geometry.attributes.position.array[3 * idx + 1] = y;

    if (update) {
      this.updatePosition();
    }
  }

  updatePosition () {
    this.geometry.attributes.position.needsUpdate = true;
  }

  setFocus (idx, focus, update = true) {
    this.geometry.attributes.focus.array[idx] = focus ? 1.0 : this.attenuation;

    if (update) {
      this.updateFocus();
    }
  }

  updateFocus () {
    this.geometry.attributes.focus.needsUpdate = true;
  }

  getEdgePosition (idx, which) {
    const pos = this.edgeGeom.attributes.position.array;
    return new three.Vector2(pos[3 * (2 * idx + which) + 0], pos[3 * (2 * idx + which) + 1]);
  }

  setEdgePosition (idx, which, x, y, update = true) {
    this.edgeGeom.attributes.position.array[3 * (2 * idx + which) + 0] = x;
    this.edgeGeom.attributes.position.array[3 * (2 * idx + which) + 1] = y;

    if (update) {
      this.updateEdgePosition();
    }
  }

  updateEdgePosition () {
    this.edgeGeom.attributes.position.needsUpdate = true;
  }

  setEdgeFocus (idx, focus, update = true) {
    this.edgeGeom.attributes.focus.array[2 * idx + 0] = focus ? 1.0 : this.attenuation;
    this.edgeGeom.attributes.focus.array[2 * idx + 1] = focus ? 1.0 : this.attenuation;

    if (update) {
      this.updateEdgeFocus();
    }
  }

  updateEdgeFocus () {
    this.edgeGeom.attributes.focus.needsUpdate = true;
  }

  setSize (idx, s, update = true) {
    this.geometry.attributes.size.array[idx] = s;

    if (update) {
      this.updateSize();
    }
  }

  updateSize () {
    this.geometry.attributes.size.needsUpdate = true;
  }

  select (name) {
    if (this.selected !== null) {
      this.geometry.attributes.selected.array[this.selected] = 0;
    }

    this.selected = this.index[name];
    this.geometry.attributes.selected.array[this.selected] = 1;

    this.geometry.attributes.selected.needsUpdate = true;
  }

  unselect () {
    this.geometry.attributes.selected.array[this.selected] = 0;
    this.geometry.attributes.selected.needsUpdate = true;

    this.selected = null;

    select('#infopanel')
      .selectAll('*')
      .remove();
  }

  focus (name, edges = true) {
    const count = this.geometry.attributes.focus.count;
    for (let i = 0; i < count; i++) {
      this.setFocus(i, false, false);
    }

    const idx = this.index[name];
    this.setFocus(idx, true, false);

    if (edges) {
      for (let i = 0; i < this.dp.edgeCount(); i++) {
        const nodes = this.dp.edgeNodes(i);

        let other = null;
        if (nodes[0] === name) {
          other = nodes[1];
        } else if (nodes[1] === name) {
          other = nodes[0];
        }

        if (other) {
          this.setEdgeFocus(i, true, false);
          this.setFocus(this.index[other], true, false);
        } else {
          this.setEdgeFocus(i, false, false);
        }
      }

      this.updateEdgeFocus();
    }

    this.updateFocus();
  }

  unfocus () {
    const count = this.geometry.attributes.focus.count;
    for (let i = 0; i < count; i++) {
      this.setFocus(i, true, false);
    }

    for (let i = 0; i < this.dp.edgeCount(); i++) {
      this.setEdgeFocus(i, true, false);
    }

    this.updateFocus();
    this.updateEdgeFocus();
  }

  display (name) {
    if (!this.index.hasOwnProperty(name)) {
      return false;
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

    select('#infopanel')
      .html(infopanel(data))
      .select('#clear')
      .on('click', () => this.undisplay());

    if (this.selected !== this.index[name]) {
      this.select(name);
      this.focus(name);
    } else {
      this.undisplay();
    }

    return true;
  }

  undisplay () {
    this.unselect();
    this.unfocus();
  }

  hideAfter (year) {
    // Collect all the nodes with discovery year after the specified year; these
    // will be hidden next.
    const toHide = this.dp.nodeNames().filter(d => !this.dp.nodeExists(d) || this.dp.nodeProperty(d, 'discovery') > year);

    // Unhide all nodes.
    this.hideNodes([]);

    // Hide the ones post year.
    this.hideNodes(toHide);
  }

  hideNodes (nodes) {
    // Unhide all nodes.
    this.dp.nodeNames().forEach(d => this.hideNode(d, false, false));

    // Hide just the nodes that are named in the list;
    nodes.forEach(d => this.hideNode(d, true, false));
    this.updateHideNode();

    // Hide all edges touching a hidden node.
    const set = new Set(nodes);
    for (let i = 0; i < this.dp.edgeCount(); i++) {
      const ends = this.dp.edgeNodes(i);
      this.hideEdge(i, set.has(ends[0]) || set.has(ends[1]), false);
    }
    this.updateHideEdge();
  }

  hideNode (name, hide, update = true) {
    this.geometry.attributes.hidden.array[this.index[name]] = hide;
    if (update) {
      this.updateHideNode();
    }
  }

  updateHideNode () {
    this.geometry.attributes.hidden.needsUpdate = true;
  }

  hideEdge (idx, hide, update = true) {
    this.edgeGeom.attributes.hidden.array[2 * idx + 0] = hide;
    this.edgeGeom.attributes.hidden.array[2 * idx + 1] = hide;

    if (update) {
      this.updateHideEdge();
    }
  }

  updateHideEdge () {
    this.edgeGeom.attributes.hidden.needsUpdate = true;
  }

  center () {
    // Compute the mean.
    const count = this.geometry.attributes.selected.count;

    let x = 0;
    let y = 0;
    for (let i = 0; i < count; i++) {
      const pos = this.getPosition(i);
      x += pos.x;
      y += pos.y;
    }
    x /= count;
    y /= count;

    for (let i = 0; i < count; i++) {
      const pos = this.getPosition (i);
      this.setPosition(i, pos.x - x, pos.y - y, false);
    }
    this.updatePosition();

    for (let i = 0; i < this.dp.edgeCount(); i++) {
      const pos0 = this.getEdgePosition(i, 0);
      this.setEdgePosition(i, 0, pos0.x - x, pos0.y - y, false);

      const pos1 = this.getEdgePosition(i, 1);
      this.setEdgePosition(i, 1, pos1.x - x, pos1.y - y, false);
    }
    this.updateEdgePosition();
  }

  expand (m) {
    const factor = m / this.expansion;
    this.expansion = m;

    const nodeCount = this.geometry.attributes.selected.count;
    for (let i = 0; i < nodeCount; i++) {
      const pos = this.getPosition(i);
      this.setPosition(i, pos.x * factor, pos.y * factor, false);
    }
    this.updatePosition();

    for (let i = 0; i < this.dp.edgeCount(); i++) {
      const pos0 = this.getEdgePosition(i, 0);
      this.setEdgePosition(i, 0, pos0.x * factor, pos0.y * factor, false);

      const pos1 = this.getEdgePosition(i, 1);
      this.setEdgePosition(i, 1, pos1.x * factor, pos1.y * factor, false);
    }
    this.updateEdgePosition();
  }

  moveCamera(dx, dy) {
    this.camera.left -= dx / this.camera.zoom;
    this.camera.right -= dx / this.camera.zoom;
    this.camera.top += dy / this.camera.zoom;
    this.camera.bottom += dy / this.camera.zoom;
    this.camera.updateProjectionMatrix();
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }

  get zoom () {
    return this.camera.zoom;
  }

  set zoom (zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();

    this.material.uniforms.zoom.value = zoom;

    this.raycaster.params.Points.threshold = this.threshold;
  }
}
