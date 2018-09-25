uniform float opacity;
varying float attenuate;

void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, attenuate * opacity);
}
