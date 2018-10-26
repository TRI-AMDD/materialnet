import React, { Component } from 'react';

import GraphVisComponent from '../../components/graph-vis';

class GraphVisContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      edges: null
    }
  }

  componentDidMount() {
    const [edgefile, nodefile] = [
      'sample-data/edges.json',
      'sample-data/nodes.json'
    ];

    let edgePromise = fetch(edgefile);
    let nodePromise = fetch(nodefile);

    Promise.all([edgePromise, nodePromise])
    .then((values) => {
      return Promise.all(values.map(x => x.json()));
    })
    .then((values) => {
      const [edges, nodes] = values;
      this.setState({...this.state, edges, nodes});
    });
  }

  render() {
    const { nodes, edges } = this.state;

    if (nodes && edges) {
      return (
        <GraphVisComponent nodes={nodes} edges={edges}/>
      );
    } else {
      return (null);
    }
  }
}

export default GraphVisContainer;
