import * as three from 'three';
import { select } from 'd3-selection';

import html from './index.pug';

const circleGeometry = new three.CircleBufferGeometry(1, 32);

class Circle {
  constructor ({color}) {
    this.material = new three.MeshLambertMaterial({
      color
    });

    this.circle = new three.Mesh(circleGeometry, this.material);
  }

  addToScene (scene) {
    scene.add(this.circle);
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

const width = 960;
const height = 540;
document.write(html());

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);

const renderer = new three.WebGLRenderer();
renderer.setSize(width, height);
select('#vis').append(() => renderer.domElement);

const geometry = new three.BoxGeometry(100, 100, 100);
const material = new three.MeshLambertMaterial({
  color: 0x00ff00
});
const cube = new three.Mesh(geometry, material);
scene.add(cube);

const circle = new Circle({
  color: 0xff0000
});
circle.radius = 80;
circle.position.x = 200;
circle.position.y = 200;
circle.addToScene(scene);

const circle2 = new Circle({
  color: 0x00ff00,
  scene
});
circle2.position.x = 200;
circle2.position.y = -200;
circle2.radius = 25;
circle2.addToScene(scene);

const circle3 = new Circle({
  color: 0xddaa22,
  scene
});
circle3.position.x = 200;
circle3.position.y = -100;
circle3.radius = 25;
circle3.addToScene(scene);

const dirLight = new three.DirectionalLight();
dirLight.position.x = 0;
dirLight.position.y = 0;
dirLight.position.z = 200;
scene.add(dirLight);

let factor = 1;
let speed = 1.8;
let speedFactor = 1;
function animate () {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.02;

  material.color.b += factor * 0.01;
  circle2.color.b += factor * 0.01;
  if(material.color.b >= 1.0) {
    factor = -1;
  } else if (material.color.b <= 0.0) {
    factor = 1;
  }

  circle.position.x -= 1;

  circle2.position.x -= 2;
  circle2.position.y += speed;

  circle3.position.x -= 1;
  circle3.position.y -= speed;

  speed += speedFactor * 0.1;
  if (speed <= -1.8) {
    speedFactor = 1;
  } else if (speed >= 1.8) {
    speedFactor = -1;
  }

  renderer.render(scene, camera);
}
animate();
