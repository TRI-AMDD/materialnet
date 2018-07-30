import * as three from 'three';

import { select } from 'd3-selection';

import html from './index.pug';
import edges from './edges.json';
import positions from './positions.json';
import vertShader from './circle-vert.glsl';
import fragShader from './circle-frag.glsl';

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
const height = 540;
document.write(html());

class SceneManager {
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
      color: 0xaaaaaa,
      transparent: true,
      opacity: 0.01
    });

    this.lines = new three.LineSegments(this.edgeGeom, this.lineMaterial);
    this.scene.add(this.lines);

    // Initialize point geometry.
    positions.length = 0;
    colors.length = 0;
    let sizes = [];
    points.forEach((p, i) => {
      positions.push(p.x, p.y, 0);
      // colors.push(0, 0, 0.5);
      colors.push(0, 0, i / points.length);
      sizes.push(i * 10 / points.length);
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
  console.log(obj);
  if (obj) {
    this.geometry.attributes.color.array[3 * obj.index + 0] = Math.random();
    this.geometry.attributes.color.array[3 * obj.index + 1] = Math.random();
    this.geometry.attributes.color.array[3 * obj.index + 2] = Math.random();
    this.geometry.attributes.color.needsUpdate = true;

    this.geometry.attributes.size.array[obj.index] = Math.random() * 5 + 5;
    this.geometry.attributes.size.needsUpdate = true;
  }

  this.dragged = false;
});

scene.on('wheel', function () {
  window.event.preventDefault();
  const delta = window.event.deltaY / -50;
  const factor = delta < 0 ? 1 / -delta : delta;

  this.zoom *= factor;
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

const dirLight = new three.DirectionalLight();
dirLight.position.x = 0;
dirLight.position.y = 0;
dirLight.position.z = 200;
scene.scene.add(dirLight);

function animate (e) {
  scene.render();
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
