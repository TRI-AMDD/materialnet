uniform float opacity;
varying float attenuate;
varying float _hidden;

void main() {
  if (_hidden > 0.0) {
    discard;
  }
  gl_FragColor = vec4(0.0, 0.0, 0.0, attenuate * opacity);
}
