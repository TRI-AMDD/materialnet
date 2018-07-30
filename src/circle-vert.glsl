varying vec4 vColor;
attribute float size;

void main() {
  gl_PointSize = size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vColor = vec4(color, 1.0);
}
