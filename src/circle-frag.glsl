varying vec4 vColor;

void main() {
  float f = length(gl_PointCoord - vec2(0.5, 0.5));
  if (f > 0.5) {
    discard;
  } else if (f > 0.4) {
    float factor = abs(0.5 - f) * 10.0;
    gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), vColor, factor);
  } else {
    gl_FragColor = vColor;
  }
}
