export class SceneObject {
  constructor () {
    this.material = null;
    this.object = null;
  }

  addToScene (scene) {
    scene.add(this.object);
  }

  get uuid () {
    return this.object.uuid;
  }

  get position () {
    return this.object.position;
  }

  get color () {
    return this.material.color;
  }
};
