import * as d3 from 'd3-force';

import fs from 'fs';
import { performance } from 'perf_hooks';

// Grab the edgefile off the command line args.
const edgefile = process.argv[2];
if (!edgefile) {
  console.error('usage: layout.js <edgefile> <iterations=300>');
  process.exit(1);
}

let iterations = process.argv[3];
if (iterations === undefined) {
  iterations = 300;
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
      index[n] = count;
      reverseIndex[count] = n;
      count++;
      nodes.push({
        name: n
      });
    }
  });

  links.push({
    source: index[e[0]],
    target: index[e[1]]
  });
});

// Create a force simulation object.
const layout = d3.forceSimulation()
  .nodes(nodes)
  .force('charge', d3.forceManyBody())
  .force('link', d3.forceLink(links).distance(300).strength(1))
  // .force('center', d3.forceCenter())
  .stop();

let cycle = 0;
const start = performance.now();
const tick = () => {
  ++cycle;

  const now = performance.now();
  const elapsed = now - start;

  const est = Math.floor(0.01 * elapsed / cycle * (iterations - cycle)) / 10;

  process.stderr.write(`\r${cycle} / ${iterations} (${Math.floor(0.01 * elapsed) / 10}s elapsed, ~${est}s remaining)`);
};

const end = () => {
  console.log(JSON.stringify(nodes.map(n => ({x: n.x, y: n.y, name: n.name}))));
};

for (let i = 0; i < iterations; i++) {
  layout.tick();
  tick();
}

end();
