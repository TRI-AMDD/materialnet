import * as three from 'three';

import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { color as d3Color } from 'd3-color';

import html from './index.pug';
import edges from './data/edges.json';
import nodes from './data/nodes.json';
import positions from './data/positions.json';
import vertShader from './shader/circle-vert.glsl';
import fragShader from './shader/circle-frag.glsl';

function minmax (arr) {
  let min = Infinity;
  let max = -Infinity;

  arr.forEach(v => {
    if (v < min) {
      min = v;
    }

    if (v > max) {
      max = v;
    }
  });

  return {
    min,
    max
  };
}

function computeGraph (edges) {
  // Create a node index table.
  let index = {};
  let count = 0;
  edges.forEach(e => {
    // Create an entry if the node hasn't been seen yet.
    e.forEach(n => {
      if (!index.hasOwnProperty(n)) {
        // Record the index.
        index[n] = count++;
      }
    });
  });

  // Create a version of the edges list that has indices instead of names.
  const edgeIndex = edges.map(e => e.map(n => index[n]));

  return {
    nodeIndex: index,
    edgeIndex
  };
}

const width = 960;
const height =540;
document.write(html());

class SceneManager {
  constructor ({el, width, height, points, lines}) {
    this.width = width;
    this.height = height;

    this.scene = new three.Scene();
    this.scene.background = new three.Color(0xeeeeee);

    this.camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1);

    this.raycaster = new three.Raycaster();
    this.threshold = 6;
    this.raycaster.params.Points.threshold = this.threshold;

    this.mouse = new three.Vector2();
    this.pixel = new three.Vector2();

    this.renderer = new three.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(width, height);

    this.el = this.renderer.domElement;
    select(el).append(() => this.el);

    // Initialize edge geometry.
    let positions = [];
    let colors = [];

    lines.forEach(e => {
      positions.push(points[e[0]].x, points[e[0]].y, -0.1);
      positions.push(points[e[1]].x, points[e[1]].y, -0.1);
      colors.push(1, 1, 1);
    });

    this.edgeGeom = new three.BufferGeometry();
    this.edgeGeom.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.edgeGeom.addAttribute('color', new three.Float32BufferAttribute(colors, 3).setDynamic(true));
    this.edgeGeom.computeBoundingSphere();

    this.lineMaterial = new three.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.05
    });

    this.lines = new three.LineSegments(this.edgeGeom, this.lineMaterial);
    this._linksVisible = true;
    this.scene.add(this.lines);

    // Create a sequential colormap.
    this.cmap = scaleLinear()
      .domain([1945, 2015])
      .range(['#3182bd', '#31a354']);

    // Initialize point geometry.
    positions.length = 0;
    colors.length = 0;
    let sizes = [];
    points.forEach((p, i) => {
      positions.push(p.x, p.y, 0);

      let color;
      if (nodes.hasOwnProperty(p.name)) {
        color = d3Color(this.cmap(nodes[p.name].discovery));
      } else {
        color = d3Color('#de2d26');
      }

      colors.push(color.r / 255, color.g / 255, color.b / 255);

      if (nodes.hasOwnProperty(p.name)) {
        sizes.push(10 + Math.sqrt(nodes[p.name].degree));
      } else {
        sizes.push(10);
      }
    });

    this.geometry = new three.BufferGeometry();
    this.geometry.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.geometry.addAttribute('color', new three.Float32BufferAttribute(colors, 3).setDynamic(true));
    this.geometry.addAttribute('size', new three.Float32BufferAttribute(sizes, 1).setDynamic(true));
    this.geometry.computeBoundingSphere();

    this.material = new three.ShaderMaterial({
      vertexColors: three.VertexColors,
      uniforms: {
        color: new three.Color(1.0, 0.0, 0.0)
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    this.points = new three.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  linksVisible (vis) {
    this._linksVisible = vis;
    this.lines.visible = this._linksVisible;
  }

  setConstSize (s) {
    for(let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      this.setSize(i, s);
    }

    this.updateSize();
  }

  setDegreeSize () {
    positions.forEach((p, i) => {
      if (nodes.hasOwnProperty(p.name)) {
        this.setSize(i, 10 + Math.sqrt(nodes[p.name].degree));
      } else {
        this.setSize(i, 10);
      }
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
    positions.forEach((p, i) => {
      let color;
      if (nodes.hasOwnProperty(p.name)) {
        color = d3Color(this.cmap(nodes[p.name].discovery));
      } else {
        color = d3Color('#de2d26');
      }

      this.setColor(i, color.r / 255, color.g / 255, color.b / 255);
    });

    this.updateColor();
  }

  on (eventType, cb) {
    select(this.el).on(eventType, cb.bind(this));
  }

  pick () {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const results = this.raycaster.intersectObjects(this.scene.children);
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

  setSize (idx, s, update = true) {
    this.geometry.attributes.size.array[idx] = s;

    if (update) {
      this.updateSize();
    }
  }

  updateSize () {
    this.geometry.attributes.size.needsUpdate = true;
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

    this.raycaster.params.Points.threshold = this.threshold / zoom;
  }
}

const { edgeIndex } = computeGraph(edges);

const scene = new SceneManager({
  el: '#vis',
  width,
  height,
  points: positions,
  lines: edgeIndex
});

scene.on('mousemove.always', function () {
  const bbox = this.el.getBoundingClientRect();

  this.pixel.x = window.event.clientX - bbox.left;
  this.pixel.y = window.event.clientY - bbox.top;

  this.mouse.x = (this.pixel.x / width) * 2 - 1;
  this.mouse.y = -((this.pixel.y / height) * 2 - 1);
});

scene.on('click', function () {
  if (this.dragged) {
    this.dragged = false;
    return;
  }

  const obj = this.pick();
  if (obj) {
    if (obj.index < positions.length) {
      const name = positions[obj.index].name;
      const data = nodes[name];

      if (data) {
        select('#name').text(`${name} (${nodes[name].discovery})`);
        select('#degree').html(` ${nodes[name].degree} derived materials`);
      } else {
        select('#name').text(`${name}`);
        select('#degree').text('');
      }
    }
  }

  this.dragged = false;
});

scene.on('wheel', function () {
  // Don't scroll the webpage.
  window.event.preventDefault();

  // Compute the amount of the roll.
  const delta = window.event.deltaY / -50;
  const factor = delta < 0 ? 1 / -delta : delta;

  // Prevent a zoom operation if it would exceed the zoom slider range.
  const slider = select('#zoom').node();
  const step = slider.valueAsNumber;
  if ((factor > 1 && step === 113) || (factor < 1 && step === 0)) {
    return;
  }

  // Adjust the zoom level.
  this.zoom *= factor;

  // And move the zoom slider.
  const steps = Math.round(Math.log(factor) / Math.log(1.06));
  if (steps > 0) {
    for (let i = 0; i < steps; i++) {
      slider.stepUp();
    }
  } else {
    for (let i = 0; i < -steps; i++) {
      slider.stepDown();
    }
  }
});

scene.on('mousedown', function () {
  this.dragging = true;
  this.dragPoint = {...this.pixel};
});

scene.on('mousemove.drag', function () {
  if (!this.dragging) {
    return;
  }

  this.dragged = true;

  const delta = {
    x: this.pixel.x - this.dragPoint.x,
    y: this.pixel.y - this.dragPoint.y
  };

  this.dragPoint = {...this.pixel};

  // this.camera.position += new three.Vector3(delta.x, delta.y, 0);
  this.camera.left -= delta.x / this.zoom;
  this.camera.right -= delta.x / this.zoom;
  this.camera.top += delta.y / this.zoom;
  this.camera.bottom += delta.y / this.zoom;
  this.camera.updateProjectionMatrix();
});

scene.on('mouseup', function () {
  this.dragging = false;
});

select('#links').on('change', function () {
  const me = select(this);
  const visible = me.property('checked');

  scene.linksVisible(visible);
});

select('#color').on('change', function () {
  const menu = select(this).node();
  const choice = select(menu.options[menu.selectedIndex]);
  const mode = choice.attr('data-name');

  switch(mode) {
    case 'none':
      scene.setConstColor(0.2, 0.3, 0.8);
    break;

    case 'discovery':
      scene.setDiscoveryColor();
    break;

    default:
      throw new Error(`illegal size option: "${mode}"`);
  }
});

select('#size').on('change', function () {
  const menu = select(this).node();
  const choice = select(menu.options[menu.selectedIndex]);
  const mode = choice.attr('data-name');

  switch(mode) {
    case 'none':
      scene.setConstSize(10);
    break;

    case 'degree':
      scene.setDegreeSize();
    break;

    default:
      throw new Error(`illegal size option: "${mode}"`);
  }
});

select('#zoom').node().valueAsNumber = 35;
select('#zoom').on('input', function () {
  const slider = select(this).node();
  const value = slider.valueAsNumber;
  const zoom = 0.125 * Math.pow(1.06, value);

  scene.zoom = zoom;
});

function animate (e) {
  scene.render();
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);

window.scene = scene;
