import * as d3 from 'd3-force';

import fs from 'fs';
import { performance } from 'perf_hooks';

// Grab the edgefile off the command line args.
const edgefile = process.argv[2];
if (!edgefile) {
  console.error('usage: layout.js <edgefile>');
  process.exit(1);
}

// Parse out the edge JSON.
const text = fs.readFileSync(edgefile, 'utf8');
const edges = JSON.parse(text);

// Process nodes and edges from the edge data.
//
// Begin by collecting unique nodes and recording the source/target indices for
// each link.
let index = {};
let reverseIndex = {};
let nodes = [];
let links = [];
let count = 0;
edges.forEach(e => {
  e.forEach(n => {
    if (!index.hasOwnProperty(n)) {
      index[n] = count
      reverseIndex[count] = n;
      count++;
      nodes.push({});
    }
  });

  links.push({
    source: index[e[0]],
    target: index[e[1]]
  });
});

// Initialize the positions of the nodes to lie along a circle.
const r = 1000;
const tau = 2 * Math.PI;
nodes.forEach((n, i) => {
  n.x = r * Math.cos(i * tau / nodes.length);
  n.y = r * Math.sin(i * tau / nodes.length);
});

// Create a force simulation object.
const radius = 20;
const layout = d3.forceSimulation()
  .nodes(nodes)
  .force('charge', d3.forceManyBody()
    .strength(-80))
  .force('link', d3.forceLink(links)
    .distance(1000)
    .strength(1)
    .iterations(10))
  .force('center', d3.forceCenter())
  .force('collision', d3.forceCollide(2 * radius))
  .velocityDecay(0.9)
  .stop();

let cycle = 0;
const start = performance.now();
layout.on('tick', () => {
  ++cycle;

  const now = performance.now();
  const elapsed = now - start;

  const est = Math.floor(0.01 * elapsed / cycle * (300 - cycle)) / 10;

  process.stderr.write(`\r${cycle} / 300 (${Math.floor(0.01 * elapsed) / 10}s elapsed, ~${est}s remaining)`);
});

layout.on('end', () => {
  let coords = {};
  nodes.forEach((n, i) => {
    coords[reverseIndex[i]] = {
      x: n.x,
      y: n.y
    };
  });

  console.log(JSON.stringify(coords, null, 2));
});

layout.restart();
