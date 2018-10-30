varying vec4 vColor;
varying vec4 edgeColor;
varying float _hidden;

void main() {
  float f = length(gl_PointCoord - vec2(0.5, 0.5));
  if (_hidden > 0.0 || f > 0.5) {
    discard;
  } else if (f > 0.4) {
    gl_FragColor = edgeColor;
  } else {
    gl_FragColor = vColor;
  }
}
