import * as three from 'three';
import { select } from 'd3-selection';
import * as cola from 'webcola';

import html from './index.pug';
import edges from './edges.json';
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

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);

const renderer = new three.WebGLRenderer({
  antialias: true
});
renderer.setSize(width, height);
select('#vis').append(() => renderer.domElement);

const raycaster = new three.Raycaster();
const mouse = new three.Vector2();
let hover = false;
select(renderer.domElement)
  .on('mousemove', () => {
    hover = true;

    const bbox = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - bbox.left) / width) * 2 - 1;
    mouse.y = -(((event.clientY - bbox.top) / height) * 2 - 1);

    console.log(mouse);
  })
  .on('mouseout', () => {
    hover = false;
  });

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

  if (hover) {
    raycaster.setFromCamera(mouse, camera);
    const isect = raycaster.intersectObjects(scene.children);
    if (isect.length > 0) {
      console.log(isect);
      console.log(isect[0].object);
      isect[0].object.material.color.r = Math.random();
      isect[0].object.material.color.g = Math.random();
      isect[0].object.material.color.b = Math.random();
    }
  }

  renderer.render(scene, camera);

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
