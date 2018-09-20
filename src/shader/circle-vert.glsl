varying vec4 vColor;
attribute float size;
uniform float zoom;

void main() {
  gl_PointSize = zoom * 0.5 * size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vColor = vec4(color, 1.0);
}
