attribute float focus;
varying float attenuate;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  attenuate = focus;
}
