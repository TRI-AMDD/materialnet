varying vec4 vColor;
attribute float size;
uniform float zoom;
attribute float selected;
varying vec4 edgeColor;
attribute float focus;
attribute float hidden;
varying float _hidden;

void main() {
  gl_PointSize = zoom * 0.5 * size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vColor = selected > 0.5 ? vec4(1.0, 1.0, 0.0, focus) : vec4(color, focus);
  edgeColor = vec4(0.0, 0.0, 0.0, focus);
  _hidden = hidden;
}
