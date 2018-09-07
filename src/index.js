import * as three from 'three';

import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { color as d3Color } from 'd3-color';
import { defineCustomElements as defineMolecule } from '@openchemistry/molecule';

import html from './index.pug';
import infopanel from './infopanel.pug';

import edges from './data/edges.json';
import nodes from './data/nodes.json';
import { DiskDataProvider } from './DataProvider';
import vertShader from './shader/circle-vert.glsl';
import fragShader from './shader/circle-frag.glsl';

import testStructure from './testMolecule.json';

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

const width = 960;
const height =540;
document.write(html());

class SceneManager {
  constructor ({el, width, height, dp}) {
    this.width = width;
    this.height = height;
    this.dp = dp;

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

    for (let i = 0; i < this.dp.edgeCount(); i++) {
      const edgePos = this.dp.edgePosition(i);
      positions.push(edgePos[0].x, edgePos[0].y, -0.1);
      positions.push(edgePos[1].x, edgePos[1].y, -0.1);

      colors.push(1, 1, 1);
    }

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
    let selected = [];

    this.dp.nodeNames().forEach(name => {
      const p = this.dp.nodePosition(name);

      positions.push(p.x, p.y, 0);

      let color;
      const discovery = this.dp.nodeProperty(name, 'discovery');
      if (discovery !== null) {
        color = d3Color(this.cmap(discovery));
      } else {
        color = d3Color('#de2d26');
      }

      colors.push(color.r / 255, color.g / 255, color.b / 255);

      sizes.push(10 + Math.sqrt(this.dp.nodeProperty(name, 'degree')));
      selected.push(0);
    });

    this.geometry = new three.BufferGeometry();
    this.geometry.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.geometry.addAttribute('color', new three.Float32BufferAttribute(colors, 3).setDynamic(true));
    this.geometry.addAttribute('size', new three.Float32BufferAttribute(sizes, 1).setDynamic(true));
    this.geometry.addAttribute('selected', new three.Float32BufferAttribute(selected, 1).setDynamic(true));
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

    this.points = new three.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  linksVisible (vis) {
    this._linksVisible = vis;
    this.lines.visible = this._linksVisible;
  }

  setLinkOpacity (o) {
    this.lineMaterial.opacity = o;
  }

  setConstSize (s) {
    for(let i = 0; i < this.geometry.attributes.size.array.length; i++) {
      this.setSize(i, s);
    }

    this.updateSize();
  }

  setDegreeSize () {
    this.dp.nodeNames().forEach((name, i) => {
      this.setSize(i, 10 + Math.sqrt(this.dp.nodeProperty(name, 'degree')));
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

    this.material.uniforms.zoom.value = zoom;

    this.raycaster.params.Points.threshold = this.threshold;
  }
}

const scene = new SceneManager({
  el: '#vis',
  width,
  height,
  dp: new DiskDataProvider(nodes, edges)
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
    if (obj.index < this.dp.nodeNames().length) {
      const name = this.dp.nodeNames()[obj.index];
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

      select('#infopanel').html(infopanel(data));
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

select('#opacity').node().valueAsNumber = 5;
select('#opacity').on('input', function () {
  const slider = select(this).node();
  const value = slider.valueAsNumber;
  const opacity = value / 100;

  scene.setLinkOpacity(opacity);
});

function animate (e) {
  scene.render();
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);

defineMolecule(window);
select('#structure').node().cjson = testStructure;

window.scene = scene;
