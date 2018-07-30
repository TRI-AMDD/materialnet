varying vec4 vColor;

void main() {
  gl_PointSize = 10.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vColor = vec4(color, 1.0);
}
