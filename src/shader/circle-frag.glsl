varying vec4 vColor;
varying vec4 edgeColor;

void main() {
  float f = length(gl_PointCoord - vec2(0.5, 0.5));
  if (f > 0.5) {
    discard;
  } else if (f > 0.4) {
    float factor = abs(0.5 - f) * 10.0;
    gl_FragColor = mix(edgeColor, vColor, factor);
  } else {
    gl_FragColor = vColor;
  }
}
