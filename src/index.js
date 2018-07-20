import * as three from 'three';
import { select } from 'd3-selection';
import * as cola from 'webcola';

import html from './index.pug';
import edges from './edges.json';

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
  const edgeIndex = edges.map(e => e.map(n => index[n]))

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

const circleGeometry = new three.CircleBufferGeometry(1, 32);

class Circle {
  constructor () {
    this.material = new three.MeshLambertMaterial({
      color: 0xffffff
    });

    this.circle = new three.Mesh(circleGeometry, this.material);
  }

  addToScene (scene) {
    scene.add(this.circle);
  }

  get position () {
    return this.circle.position;
  }

  get color () {
    return this.material.color;
  }

  get radius () {
    return this.circle.scale.x;
  }

  set radius (scale) {
    this.circle.scale.x = this.circle.scale.y = scale;
  }
}

class Line {
  constructor () {
    this.material = new three.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    this.geometry = new three.Geometry();
    this.geometry.vertices.push(new three.Vector3(-100, 100, 0));
    this.geometry.vertices.push(new three.Vector3(100, -100, 0));

    this.line = new three.Line(this.geometry, this.material);
  }

  get x0 () {
    return this.geometry.vertices[0].x;
  }

  get x1 () {
    return this.geometry.vertices[1].x;
  }

  get y0 () {
    return this.geometry.vertices[0].y;
  }

  get y1 () {
    return this.geometry.vertices[1].y;
  }

  set x0 (x) {
    this.geometry.vertices[0].setX(x);
    this.geometry.verticesNeedUpdate = true;
  }

  set x1 (x) {
    this.geometry.vertices[1].setX(x);
    this.geometry.verticesNeedUpdate = true;
  }

  set y0 (y) {
    this.geometry.vertices[0].setY(y);
    this.geometry.verticesNeedUpdate = true;
  }

  set y1 (y) {
    this.geometry.vertices[1].setY(y);
    this.geometry.verticesNeedUpdate = true;
  }

  addToScene (scene) {
    scene.add(this.line);
  }
}

const width = 960;
const height = 540;
document.write(html());

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);

const renderer = new three.WebGLRenderer({
  antialias: true
});
renderer.setSize(width, height);
select('#vis').append(() => renderer.domElement);

const dirLight = new three.DirectionalLight();
dirLight.position.x = 0;
dirLight.position.y = 0;
dirLight.position.z = 200;
scene.add(dirLight);

// Prepare the graph from the edge data..
const graph = computeGraph(edges);

// Animate the graph.
graph.circles.forEach(c => c.addToScene(scene));
graph.links.forEach(l => l.addToScene(scene));

function animate (e) {
  graph.layout.tick();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

graph.layout.start(1,0,0,0,false);
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
