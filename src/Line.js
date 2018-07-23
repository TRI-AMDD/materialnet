import * as three from 'three';

import { SceneObject } from './SceneObject';

export class Line extends SceneObject {
  constructor () {
    super();

    this.material = new three.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    this.geometry = new three.Geometry();
    this.geometry.vertices.push(new three.Vector3(0, 0, -0.1));
    this.geometry.vertices.push(new three.Vector3(0, 0, -0.1));

    this.object = new three.Line(this.geometry, this.material);
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
    scene.add(this.object);
  }
}
