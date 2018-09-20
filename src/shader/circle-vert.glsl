varying vec4 vColor;
attribute float size;
uniform float zoom;
attribute float selected;
varying vec4 edgeColor;

void main() {
  gl_PointSize = zoom * 0.5 * size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vColor = vec4(color, 1.0);
  edgeColor = selected > 0.5 ? vec4(1.0, 1.0, 0.0, 1.0) : vec4(0.0, 0.0, 0.0, 0.0);
}
