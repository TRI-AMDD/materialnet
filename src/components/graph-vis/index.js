import React, { Component } from 'react';

import { SceneManager } from '../../scene-manager';
import { DiskDataProvider } from '../../data-provider';

class GraphVisComponent extends Component {
  visElement;
  scene;
  data;


  componentDidMount() {
    const { edges, nodes } = this.props;
    this.data = new DiskDataProvider(nodes, edges);
    console.log('DATAMANAGER', this.data);
    this.scene = new SceneManager({
      el: this.visElement,
      width: 1000,
      height: 400,
      dp: this.data
    });

    this.scene.linksVisible(false);

    const animate = (e) => {
      this.scene.render();
      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  }

  render() {
    return (
      <div ref={ref => {this.visElement = ref}}></div>
    );
  }
}

export default GraphVisComponent;
