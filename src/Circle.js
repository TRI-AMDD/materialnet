import * as three from 'three';

const circleGeometry = new three.CircleBufferGeometry(1, 32);

export class Circle {
  constructor () {
    this.material = new three.MeshLambertMaterial({
      color: 0xffffff
    });

    this.circle = new three.Mesh(circleGeometry, this.material);
  }

  addToScene (scene) {
    scene.add(this.circle);
  }

  get uuid () {
    return this.circle.uuid;
  }

  get position () {
    return this.circle.position;
  }

  get color () {
    return this.material.color;
  }

  get radius () {
    return this.circle.scale.x;
  }

  set radius (scale) {
    this.circle.scale.x = this.circle.scale.y = scale;
  }
}
