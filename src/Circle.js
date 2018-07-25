import * as three from 'three';

import { SceneObject } from './SceneObject';

const circleGeometry = new three.CircleBufferGeometry(1, 32);

export class Circle extends SceneObject {
  constructor () {
    super();

    this.material = new three.MeshLambertMaterial({
      color: 0x808080
    });

    this.object = new three.Mesh(circleGeometry, this.material);
  }

  // addToScene (scene) {
    // scene.add(this.object);
  // }

  // get uuid () {
    // return this.object.uuid;
  // }

  // get position () {
    // return this.object.position;
  // }

  // get color () {
    // return this.material.color;
  // }

  get radius () {
    return this.object.scale.x;
  }

  set radius (scale) {
    this.object.scale.x = this.object.scale.y = scale;
  }
}
