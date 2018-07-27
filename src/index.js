import * as three from 'three';

import { select } from 'd3-selection';
import * as cola from 'webcola';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force';

import html from './index.pug';
import edges from './edges.json';
import positions from './positions.json';
import { SceneObject } from './SceneObject';
import { Circle } from './Circle';
import { Line } from './Line';

const layoutEngine = 'd3';

function computeGraph (edges) {
  const radius = 20;

  // Create a node index table.
  let index = {};
  let circles = [];
  let links = [];
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

  // let layout;
  // if (layoutEngine === 'webcola') {
    // // Create a Cola layout to manipulate the objects.
    // layout = new cola.Layout()
      // .linkDistance(3 * radius)
      // .avoidOverlaps(true)
      // .links(edgeIndex.map(e => ({
        // source: e[0],
        // target: e[1]
      // })));
    // layout.nodes().forEach(n => {
      // n.width = n.height = 2 * radius;
    // });
  // } else if (layoutEngine === 'd3') {
    // layout = forceSimulation()
      // .nodes(circles.map((d, i) => ({
        // x: positions[i].x,
        // y: positions[i].y
      // })))
      // .force('charge', forceManyBody().strength(-80))
      // .force('link', forceLink(edgeIndex.map(e => ({ source: e[0], target: e[1] }))).distance(1000).strength(1).iterations(10))
      // .force('center', forceCenter(0, 0))
      // .force('collision', forceCollide(2 * radius))
      // .velocityDecay(0.9)
      // .stop();
  // }

  return {
    nodeIndex: index,
    edgeIndex,
  }; }

const width = 960;
const height = 540;
document.write(html());

class SceneManager2 {
  constructor ({el, width, height, points, lines}) {
    this.width = width;
    this.height = height;

    this.scene = new three.Scene();
    this.scene.background = new three.Color(0x000000);

    this.camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1, 1);

    this.raycaster = new three.Raycaster();
    this.threshold = 6;
    this.raycaster.params.Points.threshold = this.threshold;

    this.mouse = new three.Vector2();

    this.renderer = new three.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(width, height);

    this.el = this.renderer.domElement;
    select(el).append(() => this.el);

    // Initialize edge geometry.
    let positions = [];
    let colors = [];
    let color = new three.Color();

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
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.01
    });

    this.lines = new three.LineSegments(this.edgeGeom, this.lineMaterial);
    this.scene.add(this.lines);

    // Initialize point geometry.
    positions.length = 0;
    colors.length = 0;
    points.forEach((p, i) => {
      positions.push(p.x, p.y, 0);
      // colors.push(0, 0, 0.5);
      colors.push(0, 0, i / points.length);
    });

    this.geometry = new three.BufferGeometry();
    this.geometry.addAttribute('position', new three.Float32BufferAttribute(positions, 3).setDynamic(true));
    this.geometry.addAttribute('color', new three.Float32BufferAttribute(colors, 3).setDynamic(true));
    this.geometry.computeBoundingSphere();

    this.material = new three.PointsMaterial({
      size: 10,
      vertexColors: three.VertexColors,
      sizeAttenuation: false
    });

    this.points = new three.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  on (eventType, cb) {
    select(this.el).on(eventType, cb.bind(this));
  }

  pick () {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const results = this.raycaster.intersectObjects(this.scene.children);
    if (results.length > 0) {
      return results[0];
      // return this.table[results[0].object.uuid];
    }
    return null;
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
    console.log(this.camera.zoom, this.raycaster.params.Points.threshold);
  }
}

class SceneManager {
  constructor ({el, width, height}) {
    this.width = width;
    this.height = height;

    this.scene = new three.Scene();
    this.camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);

    this.renderer = new three.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(width, height);

    this.el = this.renderer.domElement;
    select(el).append(() => this.renderer.domElement);

    this.raycaster = new three.Raycaster();
    this.mouse = new three.Vector2();

    this.hover = false;

    this.table = {};
  }

  add (obj) {
    if (obj instanceof SceneObject) {
      if (this.table.hasOwnProperty(obj.uuid)) {
        throw new Error(`error: cannot add object (uuid = ${obj.uuid}) twice`);
      }

      this.table[obj.uuid] = obj;

      obj.addToScene(this.scene);
    } else {
      this.scene.add(obj);
    }
  }

  on (eventType, cb) {
    select(this.el).on(eventType, cb.bind(this));
  }

  render () {
    this.renderer.render(this.scene, this.camera);
  }

  pick () {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const results = this.raycaster.intersectObjects(this.scene.children);
    if (results.length > 0) {
      return this.table[results[0].object.uuid];
    }
    return null;
  }

  get zoom () {
    return this.camera.zoom;
  }

  set zoom (zoom) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }
}

const { edgeIndex } = computeGraph(edges);

const scene2 = new SceneManager2({
  el: '#vis',
  width,
  height,
  points: positions,
  lines: edgeIndex
});

scene2.on('mousemove', function () {
  const bbox = this.el.getBoundingClientRect();
  this.mouse.x = ((event.clientX - bbox.left) / width) * 2 - 1;
  this.mouse.y = -(((event.clientY - bbox.top) / height) * 2 - 1);
});

scene2.on('click', function () {
  const obj = this.pick();
  console.log(obj);
  if (obj) {
    this.geometry.attributes.color.array[3 * obj.index + 0] = Math.random();
    this.geometry.attributes.color.array[3 * obj.index + 1] = Math.random();
    this.geometry.attributes.color.array[3 * obj.index + 2] = Math.random();
    this.geometry.attributes.color.needsUpdate = true;
  }
});

scene2.on('wheel', function () {
  event.preventDefault();
  const delta = event.deltaY / -50;
  const factor = delta < 0 ? 1 / -delta : delta;

  this.zoom *= factor;
});

const dirLight = new three.DirectionalLight();
dirLight.position.x = 0;
dirLight.position.y = 0;
dirLight.position.z = 200;
scene2.scene.add(dirLight);

function animate (e) {
  scene2.render();
  window.requestAnimationFrame(animate);
}

// if (layoutEngine === 'webcola') {
  // console.log('initializing');
  // const start = window.performance.now()
  // graph.layout.start(1, 0, 0, 0, false);
  // const end = window.performance.now()
  // console.log('time', end - start);

  // graph.layout.on(cola.EventType.tick, e => {
    // graph.layout.nodes().forEach((n, i) => {
      // graph.circles[i].position.x = n.x;
      // graph.circles[i].position.y = n.y;
    // });

    // graph.layout.links().forEach((e, i) => {
      // graph.links[i].x0 = e.source.x;
      // graph.links[i].y0 = e.source.y;
      // graph.links[i].x1 = e.target.x;
      // graph.links[i].y1 = e.target.y;
    // });
  // });
// } else if (layoutEngine === 'd3') {

// }

function tickLayout () {
  if (layoutEngine === 'webcola') {
    graph.layout.tick();
  } else if (layoutEngine === 'd3') {
    graph.layout.nodes().forEach((n, i) => {
      graph.circles[i].position.x = n.x;
      graph.circles[i].position.y = n.y;
    });

    graph.layout.force('link').links().forEach((e, i) => {
      graph.links[i].x0 = e.source.x;
      graph.links[i].y0 = e.source.y;
      graph.links[i].x1 = e.target.x;
      graph.links[i].y1 = e.target.y;
    });
  }
}

window.tickLayout = tickLayout;
window.tick = () => graph.layout.tick();

// tickLayout();
window.requestAnimationFrame(animate);
