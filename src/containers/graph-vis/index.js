import React, { Component } from 'react';

import GraphVisComponent from '../../components/graph-vis';

class GraphVisContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      edges: null,
      dataset: {
        value: 'precise',
        options: [
          {label: 'Precise', value: 'precise'},
          {label: 'Sample 1', value: 'sample1'},
          {label: 'Sample 2', value: 'sample2'},
        ]
      },
      zoom: {
        value: 40,
        min: 0,
        max: 100
      },
      spacing: {
        value: 1,
        min: 0.1,
        max: 10
      },
      opacity: {
        value: 0.01,
        min: 0,
        max: 0.1,
        step: 0.001
      },
      year: {
        value: 2016,
        min: 1945,
        max: 2016,
        step: 1,
        play: false,
        interval: null
      },
      search: {
        value: ''
      },
      color: {
        value: 'discovery',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Year of discovery', value: 'discovery'},
          {label: 'Discovered/Hypothetical', value: 'boolean'},
          {label: 'Discovered/Undiscovered', value: 'undiscovered'}
        ]
      },
      colorYear: {
        value: 2016,
        min: 1945,
        max: 2016,
        step: 1
      },
      size: {
        value: 'normal',
        options: [
          {label: 'None', value: 'none'},
          {label: 'Degree', value: 'normal'},
          {label: 'Degree - Large', value: 'large'},
          {label: 'Degree - Huge', value: 'huge'}
        ]
      },
      showLinks: {
        value: false
      },
      nightMode: {
        value: false
      },
      selected: {
        value: null
      },
      structure: {
        value: null
      }
    }
  }

  componentDidMount() {
    this.update('precise', 'dataset');
  }

  render() {
    const {
      nodes,
      edges,
      zoom,
      dataset,
      spacing,
      opacity,
      year,
      search,
      size,
      color,
      colorYear,
      showLinks,
      nightMode,
      selected,
      structure,
    } = this.state;

    if (nodes && edges) {
      return (
        <GraphVisComponent
          update={this.update}
          setPlayState={this.setPlayState}
          nodes={nodes}
          edges={edges}
          dataset={dataset}
          zoom={zoom}
          spacing={spacing}
          opacity={opacity}
          year={year}
          search={search}
          size={size}
          color={color}
          colorYear={colorYear}
          showLinks={showLinks}
          nightMode={nightMode}
          selected={selected}
          structure={structure}
        />
      );
    } else {
      return (null);
    }
  }

  update = (value, key) => {
    if (!this.state) {
      return;
    }

    if (key === 'dataset') {
      if (value === undefined) {
        return;
      }
      const datafile = `sample-data/${value}.json`;
      fetch(datafile).then(resp => resp.json())
        .then(data => {
          this.setState(state => {
            state[key].value = value;
            state.nodes = data.nodes;
            state.edges = data.edges;

            return state;
          });
        });
    } else {
      if (key in this.state) {
        this.setState((state) => {
          state[key]['value'] = value;
          return state;
        });
      }
    }
  }

  setPlayState = (play, interval) => {
    this.setState((state, props) => {
      state['year']['play'] = play;
      state['year']['interval'] = interval;
      return state;
    });
  }
}

export default GraphVisContainer;
