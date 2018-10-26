export class DataProvider {
  constructor () {
    console.log('hi');
  }
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

    this._names = Object.keys(this.nodes);
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

  nodeDegrees (year) {
    let table = {};
    const countEdge = (node, other) => {
      if (!table.hasOwnProperty(node)) {
        table[node] = 0;
      }

      if (this.nodeExists(other) && this.nodeProperty(other, 'discovery') <= year) {
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
    return this.nodes[name].discovery !== null;
  }
}
