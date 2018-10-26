import React, { Component } from 'react';

import {
  Select,
  MenuItem,
  FormControl,
  Input,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@material-ui/core';

import { Slider } from '@material-ui/lab';

import { SceneManager } from '../../scene-manager';
import { DiskDataProvider } from '../../data-provider';

class GraphVisComponent extends Component {
  visElement;
  scene;
  data;


  componentDidMount() {
    const { edges, nodes } = this.props;
    this.data = new DiskDataProvider(nodes, edges);
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
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zoom</TableCell>
              <TableCell>Link opacity</TableCell>
              <TableCell>Node spacing</TableCell>
              <TableCell>Discovered before</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <Slider/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Slider/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Slider/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Slider/>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Search</TableCell>
              <TableCell>Node color</TableCell>
              <TableCell>Node size</TableCell>
              <TableCell>Show links</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormControl fullWidth>
                  <Input/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <Select/>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div ref={ref => {this.visElement = ref}}></div>
      </div>
    );
  }
}

export default GraphVisComponent;
