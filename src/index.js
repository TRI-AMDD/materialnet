import * as three from 'three';
import { select } from 'd3-selection';
import * as cola from 'webcola';

import html from './index.pug';
import edges from './edges.json';
import { SceneObject } from './SceneObject';
import { Circle } from './Circle';
import { Line } from './Line';

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

        // Create a circle object.
        const circ = new Circle();
        circ.radius = radius;

        circles.push(circ);
      }
    });

    links.push(new Line());
  });

  // Create a version of the edges list that has indices instead of names.
  const edgeIndex = edges.map(e => e.map(n => index[n]));

  // Create a Cola layout to manipulate the objects.
  const layout = new cola.Layout()
    .linkDistance(3 * radius)
    .avoidOverlaps(true)
    .links(edgeIndex.map(e => ({
      source: e[0],
      target: e[1]
    })));
  layout.nodes().forEach(n => {
    n.width = n.height = 2 * radius;
  });

  return {
    nodeIndex: index,
    edgeIndex,
    circles,
    links,
    layout
  };
}

const width = 960;
const height = 540;
document.write(html());

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

const scene = new SceneManager({
  el: '#vis',
  width,
  height
});
window.scene = scene;

scene.on('mousemove', function () {
  this.hover = true;

  const bbox = this.el.getBoundingClientRect();
  this.mouse.x = ((event.clientX - bbox.left) / width) * 2 - 1;
  this.mouse.y = -(((event.clientY - bbox.top) / height) * 2 - 1);
});

scene.on('click', function () {
  const obj = this.pick();
  if (obj && obj instanceof Circle) {
    obj.material.color = new three.Color(Math.random(), Math.random(), Math.random());
  }
});

scene.on('mouseout', function () {
  this.hover = false;
});

scene.on('wheel', function () {
  event.preventDefault();
  const delta = event.deltaY / -50;
  const factor = delta < 0 ? 1 / -delta : delta;

  this.zoom *= factor;
});

const dirLight = new three.DirectionalLight();
dirLight.position.x = 0;
dirLight.position.y = 0;
dirLight.position.z = 200;
scene.add(dirLight);

// Prepare the graph from the edge data..
const graph = computeGraph(edges);

// Animate the graph.
graph.circles.forEach(c => scene.add(c));
graph.links.forEach(l => scene.add(l));

function animate (e) {
  graph.layout.tick();
  scene.render();

  window.requestAnimationFrame(animate);
}

graph.layout.start(1, 0, 0, 0, false);
graph.layout.on(cola.EventType.tick, e => {
  graph.layout.nodes().forEach((n, i) => {
    graph.circles[i].position.x = n.x;
    graph.circles[i].position.y = n.y;
  });

  graph.layout.links().forEach((e, i) => {
    graph.links[i].x0 = e.source.x;
    graph.links[i].y0 = e.source.y;
    graph.links[i].x1 = e.target.x;
    graph.links[i].y1 = e.target.y;
  });
});

animate();
