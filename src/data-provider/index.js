import { extractElements } from "./parse";

export class DataProvider {
}

export function computeGraph (edges) {
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

export class DiskDataProvider extends DataProvider {
  constructor (nodes, edges) {
    super();

    this.nodes = nodes;
    this.edges = edges;

    const graph = computeGraph(edges);
    this._nodeIndex = graph.nodeIndex;
    this.edgeIndex = graph.edgeIndex;

    // inject the name of the node into the object
    Object.entries(nodes).forEach(([k, v]) => {
      v.name = k;
      v._elements = extractElements(k);
    });

    this._names = Object.keys(this.nodes);
    const bad = this._names.indexOf('value');
    if (bad > -1) {
      this._names = this._names.slice(0, bad).concat(this._names.slice(bad + 1));
    }
  }

  getBounds() {
    return this.nodeNames().reduce((bounds, name) => {
      const pos = this.nodePosition(name);
      return {
        minx: Math.min(pos.x, bounds.minx),
        maxx: Math.max(pos.x, bounds.maxx),
        miny: Math.min(pos.y, bounds.miny),
        maxy: Math.max(pos.y, bounds.maxy),
      };
    }, {
      minx: Number.POSITIVE_INFINITY,
      maxx: Number.NEGATIVE_INFINITY,
      miny: Number.POSITIVE_INFINITY,
      maxy: Number.NEGATIVE_INFINITY,
    });
  }

  edgeCount () {
    return this.edges.length;
  }

  edgePosition (idx) {
    const edge = this.edges[idx];

    const val = [
      this.nodes[edge[0]],
      this.nodes[edge[1]]
    ];

    if (val[0] === undefined || val[1] === undefined) {
      console.log(idx);
      console.log(edge);
      console.log(val);
    }

    return val;
  }

  edgeNodes (idx) {
    const edge = this.edges[idx];
    return edge;
  }

  nodeNames () {
    return this._names;
  }

  nodePosition (name) {
    const node = this.nodes[name];

    return {
      x: node.x,
      y: node.y
    };
  }

  nodeDegrees (filter) {
    let table = {};
    const countEdge = (node, other) => {
      if (!table.hasOwnProperty(node)) {
        table[node] = 0;
      }

      if (this.nodeExists(other) && filter(this.nodes[node])) {
        table[node]++;
      }
    }

    this.edges.forEach(edge => {
      countEdge(edge[0], edge[1]);
      countEdge(edge[1], edge[0]);
    });

    return table;
  }

  nodeIndex (name) {
    return this._nodeIndex[name];
  }

  nodeProperty (name, prop) {
    return this.nodes[name][prop];
  }

  nodeExists (name) {
    return this.nodes[name].discovery != null;
  }

  hasNode (name) {
    return this.nodes[name] != null;
  }
}
