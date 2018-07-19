import * as three from 'three';
import { select } from 'd3-selection';

import html from './index.pug';

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

const cGeom = new three.CircleBufferGeometry(50, 32);
const circle = new three.Mesh(cGeom, material);
circle.position.x = 200;
circle.position.y = 200;
scene.add(circle);

const circle2 = new three.Mesh(cGeom, material);
circle2.position.x = 200;
circle2.position.y = -200;
circle2.scale.x = 0.5;
circle2.scale.y = 0.5;
scene.add(circle2);

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
  if(material.color.b >= 1.0) {
    factor = -1;
  } else if (material.color.b <= 0.0) {
    factor = 1;
  }

  circle.position.x -= 1;
  circle2.position.x -= 2;
  circle2.position.y += speed;
  speed += speedFactor * 0.1;
  if (speed <= -1.8) {
    speedFactor = 1;
  } else if (speed >= 1.8) {
    speedFactor = -1;
  }

  renderer.render(scene, camera);
}
animate();
