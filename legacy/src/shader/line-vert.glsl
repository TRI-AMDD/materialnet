attribute float focus;
varying float attenuate;
attribute float hidden;
varying float _hidden;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  attenuate = focus;
  _hidden = hidden;
}
