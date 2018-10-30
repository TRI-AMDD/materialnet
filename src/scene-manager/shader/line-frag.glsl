uniform float opacity;
uniform float night;
varying float attenuate;
varying float _hidden;

void main() {
  if (_hidden > 0.0) {
    discard;
  }
  gl_FragColor = night > 0.0 ? vec4(1.0, 1.0, 1.0, attenuate * opacity) : vec4(0.0, 0.0, 0.0, attenuate * opacity);
}
