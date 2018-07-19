import * as three from 'three';
import { select } from 'd3-selection';

import html from './index.pug';

const width = 960;
const height = 540;
document.write(html());

const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new three.WebGLRenderer();
renderer.setSize(width, height);
select('#vis').append(() => renderer.domElement);

const geometry = new three.BoxGeometry(1, 1, 1);
const material = new three.MeshLambertMaterial({
  color: 0x00ff00
});
const cube = new three.Mesh(geometry, material);
scene.add(cube);

const ambLight = new three.AmbientLight(0x808080);
scene.add(ambLight);

const light = new three.PointLight(0xaaaadd, 1, 0);
light.position.set(2, 2, 0);
scene.add(light);

camera.position.z = 5;

function animate () {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.02;

  renderer.render(scene, camera);
}
animate();
